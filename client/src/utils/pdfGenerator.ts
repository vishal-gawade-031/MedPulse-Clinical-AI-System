import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generateAssessmentPDF = async (
  elementId: string,
  filename: string = "MedPulse_Clinical_Summary.pdf"
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found.`);
  }

  // Create canvas from the designated element
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution for clinical print
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  // Add image page
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  // Download PDF
  pdf.save(filename);
};
