import PDFReader from "./pdfReader.js";
const fileInput = document.getElementById('fileInput');
const extractButton = document.getElementById('extractButton');
const pdfReader = new PDFReader();

extractButton.addEventListener('click', async () => {
    if(fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const result = await pdfReader.read(file);
        console.log(result);
    } 
})
