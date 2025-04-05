import jsPDF from "jspdf";

export const exportChatToPDF = (chatHistory, chatTitle = "Chat") => {
  const doc = new jsPDF();
  doc.setFont("helvetica");
  doc.setFontSize(14);

  let y = 10;
  doc.text(chatTitle, 10, y);
  y += 10;

  chatHistory.forEach(({ role, content }) => {
    const label = role === "user" ? "User: " : "Bot: ";
    const text = label + content;
    const splitText = doc.splitTextToSize(text, 180);
    
    if (y + splitText.length * 7 > 280) {
      doc.addPage();
      y = 10;
    }

    doc.text(splitText, 10, y);
    y += splitText.length * 7 + 5;
  });

  doc.save(`${chatTitle}.pdf`);
};
