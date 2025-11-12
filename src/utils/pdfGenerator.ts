import { format } from "date-fns";
import { es } from "date-fns/locale";
import jsPDF from "jspdf";
import { Appointment } from "@/types/appointment";
import { UserData } from "@/services/user";

interface ReportOptions {
  startDate: Date;
  endDate: Date;
}

export async function generateUserReportPDF(
  userData: UserData,
  appointments: Appointment[],
  options: ReportOptions,
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  const margin = 20;
  const lineHeight = 7;
  const sectionSpacing = 10;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Informe de Usuario", margin, yPosition);
  yPosition += lineHeight * 2;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generado el: ${format(new Date(), "PPP", { locale: es })}`,
    margin,
    yPosition,
  );
  yPosition += lineHeight * 2;

  // Datos Personales
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Datos Personales", margin, yPosition);
  yPosition += lineHeight;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const personalData = [
    ["Nombre:", userData.fullName || "No especificado"],
    [
      "Documento:",
      `${userData.documentType || ""} ${userData.documentNumber || ""}`.trim() ||
        "No especificado",
    ],
    ["Fecha de Nacimiento:", userData.birthDate || "No especificado"],
    ["Sexo:", userData.gender || "No especificado"],
    ["Celular:", userData.phone || "No especificado"],
    ["Correo:", userData.email || "No especificado"],
  ];

  personalData.forEach(([label, value]) => {
    checkPageBreak(lineHeight * 1.5);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 50, yPosition);
    yPosition += lineHeight;
  });

  yPosition += sectionSpacing;

  // Datos Institucionales
  checkPageBreak(25);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Datos Institucionales", margin, yPosition);
  yPosition += lineHeight;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const institutionalData = [
    ["Estamento:", userData.status || "No especificado"],
    ["Código:", userData.code || "No especificado"],
    ["Programa Académico:", userData.program || "No especificado"],
  ];

  institutionalData.forEach(([label, value]) => {
    checkPageBreak(lineHeight * 1.5);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 50, yPosition);
    yPosition += lineHeight;
  });

  yPosition += sectionSpacing;

  // Caracterización
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Caracterización", margin, yPosition);
  yPosition += lineHeight;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  checkPageBreak(lineHeight * 1.5);
  doc.setFont("helvetica", "bold");
  doc.text("Grupos Poblacionales:", margin, yPosition);
  yPosition += lineHeight;

  if (userData.populationGroups && userData.populationGroups.length > 0) {
    userData.populationGroups.forEach((group) => {
      checkPageBreak(lineHeight * 1.5);
      doc.setFont("helvetica", "normal");
      doc.text(`• ${group}`, margin + 10, yPosition);
      yPosition += lineHeight;
    });
  } else {
    checkPageBreak(lineHeight * 1.5);
    doc.setFont("helvetica", "normal");
    doc.text("No pertenece a ningún grupo poblacional", margin + 10, yPosition);
    yPosition += lineHeight;
  }

  yPosition += lineHeight;

  checkPageBreak(lineHeight * 1.5);
  doc.setFont("helvetica", "bold");
  doc.text("Programas Sociales:", margin, yPosition);
  yPosition += lineHeight;

  if (userData.socialPrograms && userData.socialPrograms.length > 0) {
    userData.socialPrograms.forEach((program) => {
      checkPageBreak(lineHeight * 1.5);
      doc.setFont("helvetica", "normal");
      doc.text(`• ${program}`, margin + 10, yPosition);
      yPosition += lineHeight;
    });
  } else {
    checkPageBreak(lineHeight * 1.5);
    doc.setFont("helvetica", "normal");
    doc.text("No participa en programas sociales", margin + 10, yPosition);
    yPosition += lineHeight;
  }

  yPosition += sectionSpacing * 2;

  // Historial de Citas
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Historial de Citas (${format(options.startDate, "dd/MM/yyyy", { locale: es })} - ${format(options.endDate, "dd/MM/yyyy", { locale: es })})`,
    margin,
    yPosition,
  );
  yPosition += lineHeight * 2;

  if (appointments.length === 0) {
    checkPageBreak(lineHeight * 2);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      "No hay citas registradas en el rango de fechas seleccionado",
      margin,
      yPosition,
    );
    yPosition += lineHeight * 2;
  } else {
    // Ordenar citas por fecha (más recientes primero)
    const sortedAppointments = [...appointments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    sortedAppointments.forEach((appointment, index) => {
      checkPageBreak(40);

      // Separador entre citas
      if (index > 0) {
        yPosition += lineHeight;
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += lineHeight * 2;
      }

      // Fecha y hora
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const appointmentDate = format(
        new Date(appointment.date),
        "PPP",
        { locale: es },
      );
      doc.text(`${appointmentDate} - ${appointment.time}`, margin, yPosition);
      yPosition += lineHeight;

      // Estado
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const statusText = getStatusText(appointment.status);
      doc.text(`Estado: ${statusText}`, margin, yPosition);
      yPosition += lineHeight * 1.5;

      // Detalles de la cita
      doc.setFontSize(9);
      const appointmentDetails = [
        ["Servicio:", appointment.serviceType],
        ["Especialista:", appointment.specialistName],
        ["Incapacidad:", appointment.disability ? "Sí" : "No"],
        ["Primera vez:", appointment.isFirstTime ? "Sí" : "No"],
      ];

      appointmentDetails.forEach(([label, value]) => {
        checkPageBreak(lineHeight * 1.5);
        doc.setFont("helvetica", "bold");
        doc.text(label, margin, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(value, margin + 40, yPosition);
        yPosition += lineHeight;
      });

      // Motivo
      if (appointment.reason) {
        checkPageBreak(lineHeight * 3);
        doc.setFont("helvetica", "bold");
        doc.text("Motivo:", margin, yPosition);
        yPosition += lineHeight;
        doc.setFont("helvetica", "normal");
        const reasonLines = doc.splitTextToSize(
          appointment.reason,
          pageWidth - margin * 2,
        );
        reasonLines.forEach((line: string) => {
          checkPageBreak(lineHeight);
          doc.text(line, margin + 10, yPosition);
          yPosition += lineHeight;
        });
      }

      // Recomendaciones
      if (appointment.recommendations) {
        checkPageBreak(lineHeight * 3);
        doc.setFont("helvetica", "bold");
        doc.text("Recomendaciones:", margin, yPosition);
        yPosition += lineHeight;
        doc.setFont("helvetica", "normal");
        const recommendationLines = doc.splitTextToSize(
          appointment.recommendations,
          pageWidth - margin * 2,
        );
        recommendationLines.forEach((line: string) => {
          checkPageBreak(lineHeight);
          doc.text(line, margin + 10, yPosition);
          yPosition += lineHeight;
        });
      }

      yPosition += lineHeight;
    });
  }

  // Guardar PDF
  const fileName = `Informe_${userData.fullName || "Usuario"}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}

function getStatusText(status: string): string {
  switch (status) {
    case "pendiente":
      return "Pendiente";
    case "realizado":
      return "Realizada";
    case "cancelado":
      return "Cancelada";
    default:
      return status;
  }
}

