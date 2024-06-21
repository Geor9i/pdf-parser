export default class PDFReader {
    async read(file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async (event) => {
                const arrayBuffer = event.target.result;
                try {
                    const stringData = await this.extractStringData(arrayBuffer);
                    resolve(stringData); 
                } catch (error) {
                    reject(error);  
                }
            };

            reader.readAsArrayBuffer(file);
        });
    }

    async extractStringData(arrayBuffer) {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
        let tableData = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const pageData = [];
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const viewport = page.getViewport({ scale: 1 });
            const { width: pageWidth, height: pageHeight } = viewport;
            console.log({pageWidth, pageHeight});

            for (let item of textContent.items) {
                    const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
                    const [ scaleX, skewX, skewY, scaleY, x, y ] = transform;
                    pageData.push({ text: item.str, x, y, scaleX, scaleY, skewX, skewY, width: item.width, height: item.height });
            }
            this.reconstructPage(pageData, pageWidth, pageHeight);
        }
        return tableData;
    }


    reconstructPage(textItems, pageWidth, pageHeight) {
        // Group by rows
        const rowTolerance = 1; // Tolerance for row height
        const rows = [];
        textItems.sort((a, b) => a.y - b.y);  // Sort by y-coordinate to group rows
    
        let currentRow = [];
        let currentY = textItems[0].y;
    
        textItems.forEach(item => {
            if (Math.abs(item.y - currentY) > rowTolerance) {
                currentRow.sort((a, b) => a.x - b.x);
                rows.push(currentRow);
                currentRow = [];
                currentY = item.y;
            }
            currentRow.push(item);
        });
        rows.push(currentRow);
        // Log the table
    
        // Example: Create a table element
        const tableElement = document.createElement('table');
        rows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(item => {
                const td = document.createElement('td');
                td.textContent = item.text;
                tr.appendChild(td);
            });
            tableElement.appendChild(tr);
        });
    
        document.body.appendChild(tableElement);  // Append the table to the body or any other container
    }
    
}
