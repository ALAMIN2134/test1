// Automatic date Inputs on page load
const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const formattedDate = `${year}-${month}`;
document.getElementById('monthYear').value = formattedDate;

// Initialize Tax Inputs on page load
document.addEventListener('DOMContentLoaded', function() {
    updateTaxInputs();
});

// Tax Input Management
function updateTaxInputs() {
    const numRecharges = parseInt(document.getElementById('numRecharges').value) || 1;
    const taxInputs = document.getElementById('taxInputs');
    
    taxInputs.innerHTML = '';
    for(let i = 0; i < numRecharges; i++) {
        taxInputs.innerHTML += `
            <div class="mb-2">
                <label class="form-label">Recharge ${i+1} Tax (৳)</label>
                <input type="number" class="form-control tax-input" step="0.01" value="  " required>
            </div>
        `;
    }
}

// Event listener for recharge input
document.getElementById('numRecharges').addEventListener('input', updateTaxInputs);

// Main Calculation Function
function calculate() {
    // Basic Inputs
    const totalUnits = parseFloat(document.getElementById('totalUnits').value);
    const totalAmount = parseFloat(document.getElementById('totalAmount').value);
    
    if(!totalUnits || !totalAmount) {
        alert('Please fill in both Total Units and Total Amount fields');
        return;
    }

    // Tax Calculation
    let totalTax = 0;
    document.querySelectorAll('.tax-input').forEach(input => {
        totalTax += parseFloat(input.value) || 0;
    });

    // Price Calculations
    const priceWithoutTax = totalAmount / totalUnits;
    const priceWithTax = (totalAmount + totalTax) / totalUnits;

    // Sub-meter Calculations
    const sub1Units = parseFloat(document.getElementById('sub1End').value) - 
                    parseFloat(document.getElementById('sub1Start').value) || 0;
    const sub2Units = parseFloat(document.getElementById('sub2End').value) - 
                    parseFloat(document.getElementById('sub2Start').value) || 0;

    // Residual Calculations
    const residualUnits = totalUnits - (sub1Units + sub2Units);
    const residualAmount = residualUnits * priceWithTax;

    // Display Results
    showResults({
        priceWithoutTax,
        priceWithTax,
        sub1Units,
        sub2Units,
        totalTax,
        residualUnits,
        residualAmount
    });
}

/*Electricity Cost Calculator by Mohammed Alamin*/

// Display Results Function
function showResults(data) {
    const residualColor = data.residualUnits < 0 ? 'style="color: red;"' : '';
    
    const resultsHTML = `
        <div class="result-card">
            <h5>Price Per Unit</h5>
            <p>Without Tax: ৳${data.priceWithoutTax.toFixed(2)}</p>
            <p>With Tax: ৳${data.priceWithTax.toFixed(2)}</p>
        </div>

        <div class="result-card">
            <h5>Sub-meter 1 Charges</h5>
            <p>Units: ${data.sub1Units.toFixed(2)}</p>
            <p>Total: ৳${(data.sub1Units * data.priceWithTax).toFixed(2)}</p>
        </div>

        <div class="result-card">
            <h5>Sub-meter 2 Charges</h5>
            <p>Units: ${data.sub2Units.toFixed(2)}</p>
            <p>Total: ৳${(data.sub2Units * data.priceWithTax).toFixed(2)}</p>
        </div>

        <div class="residual-section">
            <h5>Main Meter Residual Charges</h5>
            <p ${residualColor}>Units Remaining: ${data.residualUnits.toFixed(2)}</p>
            <p ${residualColor}>Amount Remaining: ৳${data.residualAmount.toFixed(2)}</p>
        </div>
    `;

    document.getElementById('results').innerHTML = resultsHTML;
}

/*Electricity Cost Calculator by Mohammed Alamin*/


// PDF Generation Function
function generatePDF() {
        
    if (!document.getElementById('totalUnits').value || 
        !document.getElementById('totalAmount').value) {
        alert('Please fill in all required fields and calculate first!');
        return;
    }
    try {
        const doc = new window.jspdf.jsPDF();
      
        if(!document.getElementById('results').children.length) {
            alert('Please calculate first before generating PDF');
            return;
        }

        // Month formatting
        const monthInput = document.getElementById('monthYear').value;
        const [year, month] = monthInput.split('-');
        const monthNames = ["January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"];
        const formattedMonth = `${monthNames[parseInt(month)-1]} ${year}`;

        const primaryColor = '#0d6efd';
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Header
        doc.setFontSize(18);
        doc.setTextColor(primaryColor);
        doc.text("Electricity Cost Report", pageWidth / 2, 20, { align: "center" });
        
        doc.setDrawColor(13, 110, 253);
        doc.setLineWidth(0.5);
        doc.line(margin, 25, pageWidth - margin, 25);
        // Blue Horizontal line under the page
        doc.setDrawColor(13, 110, 253);
        doc.setLineWidth(0.5);
        doc.line(0, pageHeight - margin, pageWidth, pageHeight - margin);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        const reportDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Report generated on: ${reportDate}`, pageWidth - margin, 31, { align: "right" });

        let formData;
        try {
            // Get sub-meter readings
            const sub1Start = document.getElementById('sub1Start').value || '0';
            const sub1End = document.getElementById('sub1End').value || '0';
            const sub2Start = document.getElementById('sub2Start').value || '0';
            const sub2End = document.getElementById('sub2End').value || '0';

            const totalUnits = parseFloat(document.getElementById('totalUnits').value) || 0;
            const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;
            // Collect tax values
            const taxes = Array.from(document.querySelectorAll('.tax-input'))
                            .map(input => parseFloat(input.value) || 0);
            const totalTax = taxes.reduce((sum, val) => sum + val, 0);

            const priceWithoutTax = totalAmount / totalUnits || 0;
            const priceWithTax = (totalAmount + totalTax) / totalUnits || 0;

            formData = {
                formattedMonth,
                totalUnits,
                totalAmount,
                totalTax,
                taxes,
                priceWithoutTax,
                priceWithTax,
                sub1Start,
                sub1End,
                sub2Start,
                sub2End,
                sub1Units: (parseFloat(sub1End) || 0) - (parseFloat(sub1Start) || 0),
                sub1Cost: (parseFloat(sub1End) - parseFloat(sub1Start)) * priceWithTax || 0,
                sub2Units: (parseFloat(sub2End) || 0) - (parseFloat(sub2Start) || 0),
                sub2Cost: (parseFloat(sub2End) - parseFloat(sub2Start)) * priceWithTax || 0,
                residualUnits: totalUnits - (((parseFloat(sub1End) || 0) - (parseFloat(sub1Start) || 0)) + 
                                            ((parseFloat(sub2End) || 0) - (parseFloat(sub2Start) || 0))),
                residualAmount: (totalUnits - ((parseFloat(sub1End) - parseFloat(sub1Start)) + 
                                              (parseFloat(sub2End) - parseFloat(sub2Start)))) * priceWithTax

            };

        } catch (e) {
            console.error('Data collection error:', e);
            alert('Error: Please fill all required fields and calculate first!');
            return;
        }

        let yPos = 40;

        // Basic Information
        doc.setFontSize(12);
        doc.setTextColor(primaryColor);
        doc.text("Basic Information:", margin, yPos);
        doc.setFontSize(10);
        doc.setTextColor(0);
        yPos += 7;
        doc.text(`- Month: ${formData.formattedMonth}`, margin, yPos);
        yPos += 7;
        doc.text(`- Total Units: ${formData.totalUnits.toFixed(2)}`, margin, yPos);
        yPos += 7;
        doc.text(`- Total Amount: BDT ${formData.totalAmount.toFixed(2)}`, margin, yPos);
        yPos += 7;
        doc.text(`- Total Tax: BDT ${formData.totalTax.toFixed(2)}`, margin, yPos);
        yPos += 12;

        // Tax Breakdown (NEW SECTION)
        if(formData.totalTax > 0) {
            doc.setFontSize(12);
            doc.setTextColor(13, 110, 253);
            doc.text("Tax Breakdown:", margin, yPos);
            yPos += 7;
            
            formData.taxes.forEach((tax, index) => {
                if(tax > 0) {
                    doc.setFontSize(10);
                    doc.setTextColor(0);
                    doc.text(`- Recharge ${index + 1}: BDT ${tax.toFixed(2)}`, margin, yPos);
                    yPos += 7;
                }
            });
            yPos += 5;
        }

        // Pricing Details
        doc.setFontSize(12);
        doc.setTextColor(primaryColor);
        doc.text("Pricing Details:", margin, yPos);
        doc.setFontSize(10);
        doc.setTextColor(0);
        yPos += 7;
        doc.text(`- Price/Unit (Without Tax): BDT ${formData.priceWithoutTax.toFixed(2)}`, margin, yPos);
        yPos += 7;
        doc.text(`- Price/Unit (With Tax): BDT ${formData.priceWithTax.toFixed(2)}`, margin, yPos);
        yPos += 12;

        // Sub-meter Consumption
        doc.setFontSize(12);
        doc.setTextColor(primaryColor);
        doc.text("Sub-meter Consumption:", margin, yPos);
        doc.setFontSize(10);
        doc.setTextColor(0);
        yPos += 7;
        
        // Sub-meter 1 details
        doc.text(`- Sub-meter 1 (ALAMIN):`, margin, yPos);
        yPos += 7;
        doc.text(`  Start Reading (${formData.sub1Start}) || End Reading (${formData.sub1End})`, margin + 5, yPos);
        yPos += 7;
        doc.text(`  ${formData.sub1Units.toFixed(2)} units (BDT ${formData.sub1Cost.toFixed(2)})`, margin + 5, yPos);
        yPos += 10;
        
        // Sub-meter 2 details
        doc.text(`- Sub-meter 2:`, margin, yPos);
        yPos += 7;
        doc.text(`  Start Reading (${formData.sub2Start}) || End Reading (${formData.sub2End})`, margin + 5, yPos);
        yPos += 7;
        doc.text(`  ${formData.sub2Units.toFixed(2)} units (BDT ${formData.sub2Cost.toFixed(2)})`, margin + 5, yPos);
        yPos += 12;

        // Residual Charges
        doc.setFontSize(12);
        doc.setTextColor(primaryColor);
        doc.text("Residual Charges:", margin, yPos);
        doc.setFontSize(10);
        doc.setTextColor(formData.residualUnits < 0 ? '#dc3545' : 0);
        yPos += 7;
        doc.text(`- Remaining Units: ${formData.residualUnits.toFixed(2)}`, margin, yPos);
        yPos += 7;
        doc.text(`- Remaining Amount: BDT ${formData.residualAmount.toFixed(2)}`, margin, yPos);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Developed by MA Production", pageWidth - margin, pageHeight - 20, { align: "right" });
        //doc.save('electricity-report.pdf');
        doc.save(`electricity-report (${formattedMonth}).pdf`);
        
        
        } catch (error) {
        console.error('PDF Generation Error:', error);
        alert('Error generating PDF. Please check console for details.');
    }
}
/* Electricity Cost Calculator by Mohammed Alamin */

