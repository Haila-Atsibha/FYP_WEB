"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    AlertCircle,
    CheckCircle,
    Shapes,
    X
} from "lucide-react";
import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import DashboardLayout from "../../../../src/components/DashboardLayout";
import Button from "../../../../src/components/Button";
import AdminDataTable from "../../../../src/components/AdminDataTable";
import Modal from "../../../../src/components/Modal";
import Input from "../../../../src/components/Input";
import api from "../../../../src/services/api";
import { useToast } from "../../../../src/context/ToastContext";
import { useTranslation } from "../../../../src/hooks/useTranslation";

export default function AdminCategories() {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
    const [currentCategory, setCurrentCategory] = useState({ name: "", description: "" });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/categories");
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
            setError("Failed to load categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddClick = () => {
        setModalMode("add");
        setCurrentCategory({ name: "", description: "" });
        setFormError("");
        setIsModalOpen(true);
    };

    const handleEditClick = (category) => {
        setModalMode("edit");
        setCurrentCategory(category);
        setFormError("");
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm(t("admin_categories_delete_confirm"))) return;

        try {
            await api.delete(`/api/categories/${id}`);
            fetchCategories();
        } catch (err) {
            console.error("Delete failed:", err);
            showToast(err.response?.data?.message || t("admin_categories_delete_fail"), "error");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError("");

        try {
            if (modalMode === "add") {
                await api.post("/api/categories", currentCategory);
            } else {
                await api.put(`/api/categories/${currentCategory.id}`, currentCategory);
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (err) {
            setFormError(err.response?.data?.message || t("admin_categories_save_fail"));
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { header: t("admin_categories_col_name"), accessor: "name", render: (row) => <span className="font-bold text-foreground">{row.name}</span> },
        { header: t("admin_categories_col_desc"), accessor: "description", render: (row) => <p className="max-w-md text-sm text-text-muted">{row.description || t("admin_categories_no_desc")}</p> },
        {
            header: t("admin_categories_col_actions"),
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEditClick(row)}
                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                        title={t("admin_categories_edit_title")}
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row.id)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        title={t("admin_categories_delete_title")}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <ProtectedRoute roles={["admin"]}>
            <DashboardLayout>
                <div className="space-y-6 pb-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{t("admin_categories_title")}</h1>
                            <p className="text-text-muted mt-1">{t("admin_categories_desc")}</p>
                        </div>
                        <Button onClick={handleAddClick} className="flex items-center gap-2 shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4" />
                            <span>{t("admin_categories_add_btn")}</span>
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="bg-surface border border-border p-4 rounded-2xl">
                        <div className="relative flex-1 w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder={t("admin_categories_search_placeholder")}
                                className="w-full pl-12 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                        {error ? (
                            <div className="p-20 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-lg font-bold">{error}</p>
                                <Button onClick={fetchCategories} className="mt-4">{t("admin_retry")}</Button>
                            </div>
                        ) : (
                            <AdminDataTable
                                loading={loading}
                                columns={columns}
                                data={filteredCategories}
                            />
                        )}

                        {!loading && filteredCategories.length === 0 && (
                            <div className="p-20 text-center">
                                <Shapes className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                                <p className="text-text-muted font-medium">{t("admin_categories_no_found")}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add/Edit Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={modalMode === "add" ? t("admin_categories_create_title") : t("admin_categories_edit_title")}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {formError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {formError}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">{t("admin_categories_name_label")}</label>
                            <Input
                                placeholder={t("admin_categories_name_placeholder")}
                                value={currentCategory.name}
                                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">{t("admin_categories_desc_label")}</label>
                            <textarea
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px]"
                                placeholder={t("admin_categories_desc_placeholder")}
                                value={currentCategory.description || ""}
                                onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsModalOpen(false)}
                            >
                                {t("btn_cancel")}
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                loading={submitting}
                            >
                                {modalMode === "add" ? t("admin_categories_create_btn") : t("btn_save_changes")}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
