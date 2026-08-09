import { useEffect, useMemo, useState } from "react";

import EditBatchDialog from "./EditBatchDialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

function BatchList({ refresh }) {
    // =========================================================
    // STATE
    // =========================================================

    const [batches, setBatches] = useState([]);
    const [search, setSearch] = useState("");

    const [editBatch, setEditBatch] =
        useState(null);

    const [deleteBatchId, setDeleteBatchId] =
        useState(null);

    const [deleteBatchName, setDeleteBatchName] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [deleting, setDeleting] =
        useState(false);

    // =========================================================
    // FETCH BATCHES
    // =========================================================

    const fetchBatches = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:8000/batches"
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch batches"
                );
            }

            const data =
                await response.json();

            setBatches(data);
        } catch (error) {
            console.error(
                "FETCH ERROR:",
                error
            );

            toast.error(
                error.message ||
                "Failed to load batches"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD / REFRESH
    // =========================================================

    useEffect(() => {
        fetchBatches();
    }, [refresh]);

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredBatches = useMemo(() => {
        const text =
            search
                .trim()
                .toLowerCase();

        if (!text) {
            return batches;
        }

        return batches.filter(
            (batch) => {
                return (
                    batch.batch_name
                        ?.toLowerCase()
                        .includes(text) ||

                    batch.class_name
                        ?.toLowerCase()
                        .includes(text) ||

                    batch.center
                        ?.toLowerCase()
                        .includes(text) ||

                    batch.academic_year
                        ?.toLowerCase()
                        .includes(text)
                );
            }
        );
    }, [batches, search]);

    // =========================================================
    // OPEN DELETE
    // =========================================================

    const openDelete = (batch) => {
        setDeleteBatchId(
            batch.id
        );

        setDeleteBatchName(
            batch.batch_name ||
            "this batch"
        );
    };

    // =========================================================
    // CANCEL DELETE
    // =========================================================

    const cancelDelete = () => {
        if (deleting) {
            return;
        }

        setDeleteBatchId(null);
        setDeleteBatchName("");
    };

    // =========================================================
    // DELETE BATCH
    // =========================================================

    const deleteBatch = async () => {
        if (
            deleteBatchId === null ||
            deleteBatchId === undefined
        ) {
            toast.error(
                "Batch ID missing"
            );

            return;
        }

        try {
            setDeleting(true);

            const response = await fetch(
                `http://localhost:8000/batches/${deleteBatchId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                let errorMessage =
                    "Failed to delete batch";

                try {
                    const data =
                        await response.json();

                    errorMessage =
                        data.detail ||
                        data.message ||
                        errorMessage;
                } catch {
                    // Ignore JSON parsing error
                }

                throw new Error(
                    errorMessage
                );
            }

            toast.success(
                "Batch deleted successfully"
            );

            setDeleteBatchId(null);
            setDeleteBatchName("");

            await fetchBatches();
        } catch (error) {
            console.error(
                "DELETE ERROR:",
                error
            );

            toast.error(
                error.message ||
                "Failed to delete batch"
            );
        } finally {
            setDeleting(false);
        }
    };

    // =========================================================
    // EDIT CLOSE
    // =========================================================

    const closeEdit = () => {
        setEditBatch(null);
    };

    // =========================================================
    // EDIT SUCCESS
    // =========================================================

    const handleEditSuccess = async () => {
        setEditBatch(null);

        await fetchBatches();
    };

    // =========================================================
    // LOADING STATE
    // =========================================================

    if (loading) {
        return (
            <div className="space-y-4">

                <div className="flex items-center justify-between">

                    <div>
                        <div className="h-4 w-32 rounded bg-muted animate-pulse" />

                        <div className="mt-2 h-3 w-48 rounded bg-muted animate-pulse" />
                    </div>

                </div>

                <div className="rounded-lg border">

                    <div className="space-y-4 p-6">

                        {[1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="
                                        h-10
                                        rounded
                                        bg-muted
                                        animate-pulse
                                    "
                                />
                            )
                        )}

                    </div>

                </div>

            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="space-y-4">

            {/* =================================================
                SEARCH + COUNT
            ================================================= */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="w-full sm:max-w-md">

                    <Input
                        placeholder="Search batch, class, center or year..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>

                <div className="text-sm text-muted-foreground">

                    Showing{" "}

                    <span className="font-medium text-foreground">
                        {filteredBatches.length}
                    </span>

                    {" "}of{" "}

                    <span className="font-medium text-foreground">
                        {batches.length}
                    </span>

                    {" "}batches

                </div>

            </div>

            {/* =================================================
                EDIT DIALOG
            ================================================= */}

            {editBatch && (
                <EditBatchDialog
                    batch={editBatch}
                    close={
                        closeEdit
                    }
                    refresh={
                        handleEditSuccess
                    }
                />
            )}

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="rounded-xl border overflow-hidden">

                <div className="overflow-x-auto">

                    <Table>

                        <TableHeader>

                            <TableRow>

                                <TableHead>
                                    Batch Name
                                </TableHead>

                                <TableHead>
                                    Class
                                </TableHead>

                                <TableHead>
                                    Center
                                </TableHead>

                                <TableHead>
                                    Academic Year
                                </TableHead>

                                <TableHead className="text-right">
                                    Actions
                                </TableHead>

                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {filteredBatches.length === 0 ? (

                                <TableRow>

                                    <TableCell
                                        colSpan={5}
                                        className="h-32 text-center"
                                    >

                                        <div className="flex flex-col items-center justify-center">

                                            <p className="font-medium">
                                                {search
                                                    ? "No batches found"
                                                    : "No batches available"}
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">

                                                {search
                                                    ? "Try a different search term."
                                                    : "Create your first batch to get started."}

                                            </p>

                                        </div>

                                    </TableCell>

                                </TableRow>

                            ) : (

                                filteredBatches.map(
                                    (batch) => (

                                        <TableRow
                                            key={
                                                batch.id
                                            }
                                        >

                                            {/* BATCH */}

                                            <TableCell className="font-medium">

                                                {batch.batch_name ||
                                                    "—"}

                                            </TableCell>

                                            {/* CLASS */}

                                            <TableCell>

                                                {batch.class_name ||
                                                    "—"}

                                            </TableCell>

                                            {/* CENTER */}

                                            <TableCell>

                                                {batch.center ||
                                                    "—"}

                                            </TableCell>

                                            {/* YEAR */}

                                            <TableCell>

                                                {batch.academic_year ||
                                                    "—"}

                                            </TableCell>

                                            {/* ACTIONS */}

                                            <TableCell>

                                                <div className="flex justify-end gap-2">

                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setEditBatch(
                                                                batch
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            openDelete(
                                                                batch
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </Button>

                                                </div>

                                            </TableCell>

                                        </TableRow>

                                    )
                                )

                            )}

                        </TableBody>

                    </Table>

                </div>

            </div>

            {/* =================================================
                DELETE CONFIRMATION
            ================================================= */}

            {deleteBatchId !== null && (

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
                        cancelDelete
                    }
                >

                    <div
                        className="
                            w-full
                            max-w-md
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

                        <h2 className="text-xl font-semibold">
                            Delete Batch?
                        </h2>

                        <p className="mt-3 text-sm text-muted-foreground">

                            Are you sure you want to
                            delete{" "}

                            <span className="font-semibold text-foreground">
                                {deleteBatchName}
                            </span>

                            ?

                            <br />

                            This action cannot be undone.

                        </p>

                        <div className="mt-6 flex justify-end gap-3">

                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    deleting
                                }
                                onClick={
                                    cancelDelete
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                disabled={
                                    deleting
                                }
                                onClick={
                                    deleteBatch
                                }
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete"}
                            </Button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default BatchList;