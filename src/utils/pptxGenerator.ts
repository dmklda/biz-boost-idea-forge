import pptxgen from "pptxgenjs";

interface Slide {
  slideNumber: number;
  title: string;
  content: string;
  speakerNotes: string;
}

export const generatePptxFromSlides = async (slides: Slide[], title: string = "Pitch Deck"): Promise<void> => {
  try {
    const pptx = new pptxgen();
    
    // Configure presentation properties
    pptx.author = "Biz Boost Idea Forge";
    pptx.company = "Biz Boost";
    pptx.subject = title;
    pptx.title = title;

    // Define layout and styling
    pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
    pptx.layout = 'LAYOUT_16x9';

    // Add slides
    slides.forEach((slideData, index) => {
      const slide = pptx.addSlide();
      
      // Add background color
      slide.background = { fill: 'F8FAFC' };

      // Add slide number
      slide.addText(`${slideData.slideNumber}/12`, {
        x: 9.2,
        y: 5.2,
        w: 0.8,
        h: 0.3,
        fontSize: 10,
        color: '64748B',
        align: 'right'
      });

      // Add title
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 28,
        bold: true,
        color: '1E293B',
        align: 'left',
        fontFace: 'Arial'
      });

      // Add content
      const contentLines = slideData.content.split('\n').filter(line => line.trim());
      
      if (contentLines.length > 0) {
        // For first slide (title slide), center the content
        if (slideData.slideNumber === 1) {
          slide.addText(contentLines.join('\n'), {
            x: 1,
            y: 2,
            w: 8,
            h: 2.5,
            fontSize: 18,
            color: '475569',
            align: 'center',
            valign: 'middle',
            fontFace: 'Arial'
          });
        } else {
          // For other slides, use bullet points
          const bulletPoints = contentLines.map(line => ({
            text: line.trim(),
            options: { bullet: true, indentLevel: 0 }
          }));

          slide.addText(bulletPoints, {
            x: 0.5,
            y: 1.8,
            w: 9,
            h: 3.2,
            fontSize: 16,
            color: '475569',
            fontFace: 'Arial',
            bullet: true
          });
        }
      }

      // Add speaker notes
      if (slideData.speakerNotes) {
        slide.addNotes(slideData.speakerNotes);
      }

      // Add logo/branding area (placeholder)
      if (slideData.slideNumber === 1) {
        slide.addText("🚀", {
          x: 4.5,
          y: 3.5,
          w: 1,
          h: 1,
          fontSize: 48,
          align: 'center'
        });
      }
    });

    // Generate and download the PPTX file
    const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pptx`;
    await pptx.writeFile({ fileName });
    
    console.log('PPTX file generated successfully:', fileName);
  } catch (error) {
    console.error('Error generating PPTX:', error);
    throw new Error('Falha ao gerar arquivo PowerPoint');
  }
};