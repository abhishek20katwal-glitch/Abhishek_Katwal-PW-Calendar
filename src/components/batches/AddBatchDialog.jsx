import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function AddBatchDialog({ onSuccess }) {
    // =========================================================
    // STATE
    // =========================================================

    const [open, setOpen] =
        useState(false);

    const [batchName, setBatchName] =
        useState("");

    const [className, setClassName] =
        useState("");

    const [center, setCenter] =
        useState("");

    const [academicYear, setAcademicYear] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {
        setBatchName("");
        setClassName("");
        setCenter("");
        setAcademicYear("");
    };

    // =========================================================
    // CLOSE
    // =========================================================

    const closeDialog = () => {
        if (saving) {
            return;
        }

        resetForm();
        setOpen(false);
    };

    // =========================================================
    // SAVE BATCH
    // =========================================================

    const saveBatch = async () => {
        if (
            !batchName.trim() ||
            !className.trim() ||
            !center.trim() ||
            !academicYear.trim()
        ) {
            toast.error(
                "Please fill all fields"
            );

            return;
        }

        try {
            setSaving(true);

            const response =
                await fetch(
                    "http://localhost:8000/batches",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            batch_name:
                                batchName.trim(),

                            class_name:
                                className.trim(),

                            center:
                                center.trim(),

                            academic_year:
                                academicYear.trim(),
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.message ||
                    "Failed to save batch"
                );
            }

            toast.success(
                "Batch created successfully"
            );

            resetForm();

            setOpen(false);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error(
                "SAVE BATCH ERROR:",
                error
            );

            toast.error(
                error.message ||
                "Failed to save batch"
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <>
            {/* =================================================
                OPEN BUTTON
            ================================================= */}

            <Button
                type="button"
                onClick={() =>
                    setOpen(true)
                }
            >
                + Add Batch
            </Button>

            {/* =================================================
                MODAL
            ================================================= */}

            {open && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[9999]
                        flex
                        items-center
                        justify-center
                        bg-black/50
                        p-4
                    "
                    onClick={
                        closeDialog
                    }
                >

                    <div
                        className="
                            w-full
                            max-w-lg
                            rounded-xl
                            border
                            bg-background
                            p-6
                            shadow-2xl
                        "
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div className="mb-6">

                            <h2 className="text-xl font-semibold">
                                Add New Batch
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Create a new batch for the calendar.
                            </p>

                        </div>

                        {/* =================================================
                            FORM
                        ================================================= */}

                        <div className="space-y-4">

                            {/* BATCH NAME */}

                            <div className="space-y-2">

                                <label className="text-sm font-medium">
                                    Batch Name
                                </label>

                                <Input
                                    placeholder="e.g. 12-LJ272CA"
                                    value={
                                        batchName
                                    }
                                    onChange={(e) =>
                                        setBatchName(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                />

                            </div>

                            {/* CLASS */}

                            <div className="space-y-2">

                                <label className="text-sm font-medium">
                                    Class
                                </label>

                                <Input
                                    placeholder="e.g. 12 JEE"
                                    value={
                                        className
                                    }
                                    onChange={(e) =>
                                        setClassName(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                />

                            </div>

                            {/* CENTER */}

                            <div className="space-y-2">

                                <label className="text-sm font-medium">
                                    Center
                                </label>

                                <Input
                                    placeholder="e.g. Kota Gurukul"
                                    value={
                                        center
                                    }
                                    onChange={(e) =>
                                        setCenter(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                />

                            </div>

                            {/* ACADEMIC YEAR */}

                            <div className="space-y-2">

                                <label className="text-sm font-medium">
                                    Academic Year
                                </label>

                                <Input
                                    placeholder="e.g. 2026-27"
                                    value={
                                        academicYear
                                    }
                                    onChange={(e) =>
                                        setAcademicYear(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                />

                            </div>

                        </div>

                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="mt-6 flex justify-end gap-3">

                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    saving
                                }
                                onClick={
                                    closeDialog
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                disabled={
                                    saving
                                }
                                onClick={
                                    saveBatch
                                }
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Batch"}
                            </Button>

                        </div>

                    </div>

                </div>
            )}
        </>
    );
}

export default AddBatchDialog;