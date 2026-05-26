"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import L from "leaflet";
import { Navigation } from "lucide-react";

// A component to handle map clicks and drop the pin
function LocationSelector({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition({
                lat: e.latlng.lat,
                lng: e.latlng.lng
            });
        },
    });

    return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

// A component to auto-center the map when the position initially changes
function MapCenterer({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo([position.lat, position.lng], 15, { animate: true });
        }
    }, [map, position]);
    return null;
}

export default function LocationPickerMap({ onLocationSelect }) {
    // Default center (Addis Ababa coordinates)
    const defaultCenter = { lat: 9.03, lng: 38.74 };
    
    const [position, setPosition] = useState(null);
    const [initialLocationFetched, setInitialLocationFetched] = useState(false);

    useEffect(() => {
        // Try to get user's current location to center the map initially
        if (navigator.geolocation && !initialLocationFetched) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setPosition(newPos);
                    onLocationSelect(newPos);
                    setInitialLocationFetched(true);
                },
                (err) => {
                    console.warn("Could not get current location, using default center.", err);
                    setInitialLocationFetched(true);
                }
            );
        } else {
            setInitialLocationFetched(true);
        }
    }, [initialLocationFetched, onLocationSelect]);

    const handlePositionChange = (newPos) => {
        setPosition(newPos);
        onLocationSelect(newPos);
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPosition(newPos);
                onLocationSelect(newPos);
            },
            (err) => {
                console.warn("Could not get current location.", err);
                alert("Please enable location permissions to use this feature.");
            }
        );
    };

    const mapCenter = position || defaultCenter;

    return (
        <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-border shadow-sm relative z-10">
            <MapContainer 
                center={[mapCenter.lat, mapCenter.lng]} 
                zoom={13} 
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationSelector position={position} setPosition={handlePositionChange} />
                {position && <MapCenterer position={position} />}
            </MapContainer>
            {!position && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold z-[1000] pointer-events-none">
                    Click anywhere on the map to place a pin
                </div>
            )}
            
            {/* Current Location Button */}
            <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="absolute bottom-6 right-4 bg-white text-primary p-3 rounded-full shadow-lg border border-border hover:bg-surface z-[1000] flex items-center justify-center transition-all group active:scale-95"
                title="Use Current Location"
            >
                <Navigation size={22} className="group-hover:fill-primary/20" />
            </button>
        </div>
    );
}
