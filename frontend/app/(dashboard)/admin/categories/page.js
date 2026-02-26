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

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
        if (!window.confirm("Are you sure you want to delete this category? This might affect providers linked to it.")) return;

        try {
            await api.delete(`/api/categories/${id}`);
            fetchCategories();
        } catch (err) {
            console.error("Delete failed:", err);
            alert(err.response?.data?.message || "Failed to delete category");
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
            setFormError(err.response?.data?.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { header: "Name", accessor: "name", render: (row) => <span className="font-bold text-foreground">{row.name}</span> },
        { header: "Description", accessor: "description", render: (row) => <p className="max-w-md text-sm text-text-muted">{row.description || "No description"}</p> },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEditClick(row)}
                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                        title="Edit Category"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row.id)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        title="Delete Category"
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
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Service Categories</h1>
                            <p className="text-text-muted mt-1">Manage the types of services available on the platform.</p>
                        </div>
                        <Button onClick={handleAddClick} className="flex items-center gap-2 shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4" />
                            <span>Add New Category</span>
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="bg-surface border border-border p-4 rounded-2xl">
                        <div className="relative flex-1 w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search categories..."
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
                                <Button onClick={fetchCategories} className="mt-4">Retry</Button>
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
                                <p className="text-text-muted font-medium">No categories found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add/Edit Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={modalMode === "add" ? "Create New Category" : "Edit Category"}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {formError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {formError}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">Category Name</label>
                            <Input
                                placeholder="e.g. Home Cleaning"
                                value={currentCategory.name}
                                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">Description</label>
                            <textarea
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px]"
                                placeholder="Briefly describe what this category entails..."
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
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                loading={submitting}
                            >
                                {modalMode === "add" ? "Create Category" : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
