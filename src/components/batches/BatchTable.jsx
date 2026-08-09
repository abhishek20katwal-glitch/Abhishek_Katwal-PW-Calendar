import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";

function BatchTable({ batches }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Batch Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Center</TableHead>
                    <TableHead>Academic Year</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {batches.map((batch) => (
                    <TableRow key={batch.id}>
                        <TableCell>{batch.batch_name}</TableCell>
                        <TableCell>{batch.class_name}</TableCell>
                        <TableCell>{batch.center}</TableCell>
                        <TableCell>{batch.academic_year}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default BatchTable;