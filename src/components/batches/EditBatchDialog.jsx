import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function EditBatchDialog({
    batch,
    close,
    refresh,
}) {
    // =========================================================
    // FORM STATE
    // =========================================================

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
    // LOAD BATCH DATA
    // =========================================================

    useEffect(() => {
        if (!batch) {
            return;
        }

        setBatchName(
            batch.batch_name || ""
        );

        setClassName(
            batch.class_name || ""
        );

        setCenter(
            batch.center || ""
        );

        setAcademicYear(
            batch.academic_year || ""
        );
    }, [batch]);

    // =========================================================
    // CLOSE
    // =========================================================

    const handleClose = () => {
        if (saving) {
            return;
        }

        close();
    };

    // =========================================================
    // UPDATE BATCH
    // =========================================================

    const updateBatch = async () => {
        const cleanBatchName =
            batchName.trim();

        const cleanClassName =
            className.trim();

        const cleanCenter =
            center.trim();

        const cleanAcademicYear =
            academicYear.trim();

        // -------------------------
        // VALIDATION
        // -------------------------

        if (!cleanBatchName) {
            toast.error(
                "Please enter Batch Name"
            );
            return;
        }

        if (!cleanClassName) {
            toast.error(
                "Please enter Class Name"
            );
            return;
        }

        if (!cleanCenter) {
            toast.error(
                "Please enter Center"
            );
            return;
        }

        if (!cleanAcademicYear) {
            toast.error(
                "Please enter Academic Year"
            );
            return;
        }

        // -------------------------
        // UPDATE
        // -------------------------

        try {
            setSaving(true);

            const response =
                await fetch(
                    `http://localhost:8000/batches/${batch.id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            batch_name:
                                cleanBatchName,

                            class_name:
                                cleanClassName,

                            center:
                                cleanCenter,

                            academic_year:
                                cleanAcademicYear,
                        }),
                    }
                );

            let data = null;

            try {
                data =
                    await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to update batch"
                );
            }

            toast.success(
                "Batch updated successfully"
            );

            // Refresh list
            if (refresh) {
                await refresh();
            }

            // Close modal
            close();

        } catch (error) {
            console.error(
                "UPDATE BATCH ERROR:",
                error
            );

            toast.error(
                error.message ||
                "Failed to update batch"
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // NO BATCH
    // =========================================================

    if (!batch) {
        return null;
    }

    // =========================================================
    // UI
    // =========================================================

    return (
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
                handleClose
            }
        >

            {/* =================================================
                MODAL
            ================================================= */}

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
                        Edit Batch
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Update the batch details below.
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
                            value={
                                batchName
                            }
                            disabled={
                                saving
                            }
                            placeholder="e.g. 12-LJ272CA"
                            onChange={(e) =>
                                setBatchName(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    {/* CLASS */}

                    <div className="space-y-2">

                        <label className="text-sm font-medium">
                            Class
                        </label>

                        <Input
                            value={
                                className
                            }
                            disabled={
                                saving
                            }
                            placeholder="e.g. 12 JEE"
                            onChange={(e) =>
                                setClassName(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    {/* CENTER */}

                    <div className="space-y-2">

                        <label className="text-sm font-medium">
                            Center
                        </label>

                        <Input
                            value={
                                center
                            }
                            disabled={
                                saving
                            }
                            placeholder="e.g. Kota Gurukul"
                            onChange={(e) =>
                                setCenter(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    {/* ACADEMIC YEAR */}

                    <div className="space-y-2">

                        <label className="text-sm font-medium">
                            Academic Year
                        </label>

                        <Input
                            value={
                                academicYear
                            }
                            disabled={
                                saving
                            }
                            placeholder="e.g. 2026-27"
                            onChange={(e) =>
                                setAcademicYear(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    {/* =================================================
                        BUTTONS
                    ================================================= */}

                    <div className="flex justify-end gap-3 pt-4">

                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                saving
                            }
                            onClick={
                                handleClose
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
                                updateBatch
                            }
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default EditBatchDialog;