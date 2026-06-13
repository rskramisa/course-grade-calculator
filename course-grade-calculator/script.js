const addRowBtn = document.querySelector('.add-row-btn');
const finaliseBtn = document.querySelector('.finalise-btn');
const segmentContainer = document.querySelector('#segment-container');

/* ADD ROW BUTTON LOGIC */
addRowBtn.addEventListener('click', function() {
    const newRow = document.createElement('tr');
    newRow.className = 'blueprint-container';

    newRow.innerHTML = `
        <td>
            <input type="text" class="form-control" placeholder="example: Attendance">
        </td>
        <td>
            <input type="number" class="form-control" placeholder="example: 1" min="1">
        </td>
        <td>
            <div class="input-group">
                <input type="number" class="form-control" placeholder="example: 10" min="0" max="100">
                <span class="input-group-text bg-white">%</span>
            </div>
        </td>
        <td>
            <button type="button" class="btn btn-outline-danger remove-btn shadow-sm">
                <i class="bi bi-trash3-fill pointer-events-none"></i>
            </button>
        </td>
    `;
    segmentContainer.appendChild(newRow);
});

/* REMOVE BUTTON LOGIC */
segmentContainer.addEventListener('click', function(event) {
    const targetButton = event.target.closest('.remove-btn');
    if (targetButton) {
        const allRows = document.querySelectorAll('.blueprint-container');

        if (allRows.length > 1) {
            const rowToRemove = targetButton.closest('.blueprint-container');
            rowToRemove.remove();
        } else {
            alert('You must keep at least one row.');
        }
    }
});

/* FINALISE BREAKDOWN BUTTON LOGIC */
finaliseBtn.addEventListener('click', function() {
    const allRows = document.querySelectorAll('.blueprint-container');
    const marksSection = document.getElementById('marks-input-section');
    
    marksSection.innerHTML = '';
    marksSection.style.display = 'block';

    /* STEP 1: BUILD THE SUMMARY TABLE */
    const summaryCard = document.createElement('div');
    summaryCard.className = 'card bg-light border-0 rounded-3 mb-4';

    let tableHTML = `
        <div class="card-body p-4">
            <h4 class="h6 fw-bold text-uppercase text-secondary mb-3">Confirmed Mark Distribution</h4>
            <div class="table-responsive">
                <table class="table table-sm table-hover align-middle mb-0 text-center">
                    <thead>
                        <tr class="text-muted small">
                            <th class="text-start">Segment Name</th>
                            <th>Count</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    const segmentsData = [];

    allRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const name = inputs[0].value || 'Unnamed Segment';
        const count = parseInt(inputs[1].value) || 1;
        const percent = parseFloat(inputs[2].value) || 0;

        segmentsData.push({ name, count, percent });

        tableHTML += `
            <tr>
                <td class="text-start fw-semibold text-dark">${name}</td>
                <td><span class="fw-bold text-dark">${count}</span></td>
                <td class="fw-bold text-dark">${percent}%</td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table></div></div>`;
    summaryCard.innerHTML = tableHTML;
    marksSection.appendChild(summaryCard);

    /* --- STEP 2: BUILD MARKS INPUT GRID --- */
    const formHeading = document.createElement('h3');
    formHeading.className = 'h5 fw-bold text-dark mb-4 mt-2';
    formHeading.innerHTML = `Now, input your raw marks:`;
    marksSection.appendChild(formHeading);

    const marksContainer = document.createElement('div');
    marksContainer.className = 'row g-4';

    segmentsData.forEach(segment => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-6';

        const groupCard = document.createElement('div');
        groupCard.className = 'card border rounded-3 p-3 h-100 shadow-sm bg-white segment-input-group';
        groupCard.dataset.name = segment.name;
        groupCard.dataset.percent = segment.percent;
        groupCard.dataset.count = segment.count;

        let cardContent = `<h5 class="h6 fw-bold border-bottom pb-2 mb-3 text-dark d-flex justify-content-between align-items-center">
            ${segment.name}
            <span class="badge bg-primary text-white rounded-pill small font-monospace">${segment.percent}%</span>
        </h5>`;

        if (segment.count > 1) {
            cardContent += `
                <div class="mb-3 p-2 bg-light rounded border">
                    <label class="form-label small text-muted fw-semibold mb-1">Calculation Method:</label>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text bg-white text-muted">Take Best Of</span>
                        <input type="number" class="form-control best-of-input text-center fw-bold" value="${segment.count}" min="1" max="${segment.count}" style="max-width: 60px;">
                        <span class="input-group-text bg-white text-muted">entries</span>
                    </div>
                </div>
            `;
        }

        cardContent += `<div class="score-rows-container">`;
        for (let i = 1; i <= segment.count; i++) {
            cardContent += `
                <div class="score-row mb-2">
                    <label class="form-label small text-secondary fw-bold mb-1">${segment.count === 1 ? 'Obtained Mark' : segment.name + ' ' + i}:</label>
                    <div class="input-group input-group-sm">
                        <input type="number" class="form-control obtained-mark text-center" placeholder="Got" step="any">
                        <span class="input-group-text bg-light text-muted">/</span>
                        <input type="number" class="form-control total-mark text-center" placeholder="Out of" step="any">
                    </div>
                </div>
            `;
        }
        cardContent += `</div>`;

        groupCard.innerHTML = cardContent;
        colDiv.appendChild(groupCard);
        marksContainer.appendChild(colDiv);
    });

    marksSection.appendChild(marksContainer);

    /* --- STEP 3: CALCULATE BUTTON & RESULT BLOCK --- */
    const actionWrapper = document.createElement('div');
    actionWrapper.className = 'text-center mt-5 pt-3';

    const calcGradeBtn = document.createElement('button');
    calcGradeBtn.type = 'button';
    calcGradeBtn.className = 'btn btn-success btn-lg px-5 shadow fw-bold calculate-grade-btn';
    calcGradeBtn.innerHTML = `<i class="bi bi-calculator-fill me-2"></i>Calculate Final Grade!`;
    actionWrapper.appendChild(calcGradeBtn);

    const resultDiv = document.createElement('div');
    resultDiv.id = 'grade-result';
    resultDiv.className = 'mt-4 mx-auto';
    resultDiv.style.maxWidth = '550px';
    actionWrapper.appendChild(resultDiv);

    marksSection.appendChild(actionWrapper);

    calcGradeBtn.addEventListener('click', calculateFinalGrade);
    
    marksSection.scrollIntoView({ behavior: 'smooth' });
});

/* ==========================================================================
   GRADE CALCULATION ENGINE WITH VALIDATION
   ========================================================================== */
function calculateFinalGrade() {
    const segmentGroups = document.querySelectorAll('.segment-input-group');
    let grandTotalWeightedScore = 0;
    let overallPercentageWeight = 0;
    let isValid = true;

    // Use a standard for loop or breakable construct to halt on first error safely
    for (let i = 0; i < segmentGroups.length; i++) {
        if (!isValid) break;

        const group = segmentGroups[i];
        const segmentName = group.dataset.name;
        const segmentWeight = parseFloat(group.dataset.percent);
        const scoreRows = group.querySelectorAll('.score-row');
        
        let individualPercentages = [];

        for (let j = 0; j < scoreRows.length; j++) {
            const row = scoreRows[j];
            const obtainedInput = row.querySelector('.obtained-mark');
            const totalInput = row.querySelector('.total-mark');
            
            const obtainedValue = obtainedInput.value.trim();
            const totalValue = totalInput.value.trim();

            // STRICT BLANK CHECK: If either field is empty, trigger error and stop everything
            if (obtainedValue === "" || totalValue === "") {
                const identifier = scoreRows.length === 1 ? segmentName : `${segmentName} (Row ${j + 1})`;
                alert(`Please fill out ${identifier} for accurate calculations.`);
                
                // Focus the missing field to guide the user
                if (obtainedValue === "") obtainedInput.focus();
                else totalInput.focus();

                isValid = false;
                break;
            }

            const obtained = parseFloat(obtainedValue);
            const total = parseFloat(totalValue);

            // Numerical sanity checks
            if (obtained < 0 || total < 0) {
                alert(`Invalid data in ${segmentName}: Scores cannot be negative!`);
                isValid = false;
                break;
            }

            if (obtained > total) {
                alert(`Invalid data in ${segmentName}: Obtained mark cannot be more than Total marks!`);
                isValid = false;
                break;
            }

            if (total > 0) {
                individualPercentages.push((obtained / total) * 100);
            }
        }

        if (!isValid) break;

        if (individualPercentages.length > 0) {
            individualPercentages.sort((a, b) => b - a);

            const bestOfInput = group.querySelector('.best-of-input');
            const keepCount = bestOfInput ? parseInt(bestOfInput.value) : individualPercentages.length;
            
            const scoresToKeep = individualPercentages.slice(0, keepCount);
            const averageSegmentPercentage = scoresToKeep.reduce((sum, val) => sum + val, 0) / scoresToKeep.length;

            grandTotalWeightedScore += (averageSegmentPercentage / 100) * segmentWeight;
            overallPercentageWeight += segmentWeight;
        }
    }

    if (!isValid) return;

    const resultDiv = document.getElementById('grade-result');
    
    if (overallPercentageWeight === 0) {
        resultDiv.innerHTML = `<div class="alert alert-danger shadow-sm border-0">Please complete all score configuration blocks.</div>`;
        return;
    }

    let letterGrade = 'F';
    if (grandTotalWeightedScore >= 93) letterGrade = 'A';
    else if (grandTotalWeightedScore >= 90) letterGrade = 'A-';
    else if (grandTotalWeightedScore >= 87) letterGrade = 'B+';
    else if (grandTotalWeightedScore >= 83) letterGrade = 'B';
    else if (grandTotalWeightedScore >= 80) letterGrade = 'B-';
    else if (grandTotalWeightedScore >= 77) letterGrade = 'C+';
    else if (grandTotalWeightedScore >= 73) letterGrade = 'C';
    else if (grandTotalWeightedScore >= 70) letterGrade = 'C-';
    else if (grandTotalWeightedScore >= 67) letterGrade = 'D+';
    else if (grandTotalWeightedScore >= 60) letterGrade = 'D';
    else letterGrade = 'F';

    const NSU_grades = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    const finalGPA = NSU_grades[letterGrade];

    resultDiv.innerHTML = `
        <div class="card border-0 shadow rounded-4 overflow-hidden mt-4 animate-fade-in">
            <div class="card-header bg-custom-blue-header py-3">
                <h5 class="mb-0 h6 text-uppercase tracking-wider fw-bold">Calculation Metrics</h5>
            </div>
            <div class="card-body p-4 bg-white text-center">
                <p class="fs-5 mb-2 text-secondary">
                    Your final grade for this course is:
                </p>
                <div class="display-3 fw-black text-primary mb-2 font-monospace">
                    ${letterGrade}
                </div>
                <div class="badge bg-primary text-white fs-6 px-3 py-2 rounded-pill mb-4">
                    Performance Weight: ${grandTotalWeightedScore.toFixed(2)}%
                </div>
                <hr class="my-3 mx-auto w-50 text-muted">
                <p class="mb-0 text-muted fs-6">Earned Course GPA Point: 
                    <strong class="text-success">${finalGPA.toFixed(1)}</strong>
                </p>
            </div>
        </div>
    `;
    
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}