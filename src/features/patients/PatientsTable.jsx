import { Eye, Phone, User, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import DataTable from "../../components/ui/table";

export default function PatientsTable({ patients, total, page, pageSize, onPageChange }) {
  const columns = [
    { 
      header: "الاسم", 
      accessor: "name", 
      cellClassName: "font-medium text-gray-900",
      render: (patient) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{patient.name}</div>
            <div className="text-xs text-gray-500">ID: {String(patient.id || '').slice(-6) || "-"}</div>
          </div>
        </div>
      )
    },
    {
      header: "الهاتف",
      accessor: "phone",
      cellClassName: "text-gray-600",
      render: (patient) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{patient.phone || "-"}</span>
        </div>
      )
    },
    {
      header: "النوع",
      render: (patient) => (
        <Badge variant="secondary" className="gap-1">
          {patient.gender === "male" ? "ذكر" : "أنثى"}
        </Badge>
      ),
    },
    {
      header: "العمر",
      render: (patient) => {
        if (!patient.date_of_birth) return "-";
        const birthDate = new Date(patient.date_of_birth);
        const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        return `${age} سنة`;
      },
    },
    {
      header: "الإجراء",
      render: (patient) => (
        <Link to={`/patients/${patient.id}`}>
          <Button variant="outline" className="gap-2" size="sm">
            <Eye className="h-4 w-4" />
            عرض التفاصيل
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <DataTable 
          columns={columns} 
          data={patients ?? []} 
          total={total} 
          page={page} 
          pageSize={pageSize} 
          onPageChange={onPageChange} 
          emptyLabel="لا توجد مرضى"
        />
      </CardContent>
    </Card>
  );
}