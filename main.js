const input = document.getElementById('date');

if (!input) {
    throw new Error('input not found');
}

const form = input.form;

if (!form) {
    throw new Error('form not found');
}

const weekdays = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
};
const cloneDate = (date) => new Date(date.getTime());
const getNextWeekday = (date, weekday) => {
    const weekdayIdx = weekdays[weekday];
    const draftDate = cloneDate(date);
    draftDate.setDate(date.getDate() + ((weekdayIdx + (7 - date.getDay())) % 7));
    draftDate.setHours(20);
    draftDate.setMinutes(0);
    draftDate.setSeconds(0);
    draftDate.setMilliseconds(0);
    return draftDate;
};

const getNextLottoDraw = (date = new Date()) => {
    const weekday = date.getDay();
    const hour = date.getHours();

    if (
        ((weekday === 3 && hour > 19) || weekday > 3) &&
        ((weekday === 6 && hour < 20) || weekday < 6)
    ) {
        return getNextWeekday(date, 'saturday');
    }

    return getNextWeekday(date, 'wednesday');
};

const parseDateStr = (str) => {
    if (!str) {
        throw new Error('invalid str passed to parseDateStr');
    }
    const datePortion = str.match(/\d{2}\s?\/\s?\d{2}\s?\/\s?\d{4}/)?.[0];
    const timePortion = str.match(/\d{2}\s?:\s?\d{2}/)?.[0];

    if (!datePortion || !timePortion) {
        throw new Error('unexepected');
    }

    return new Date(
        Date.parse(
            `${datePortion.replaceAll(' ', '')} ${timePortion.replaceAll(' ', '')}`
        )
    );
};

const formatDrawDate = (date) => {
    const day = date.toLocaleDateString('en-US', {
        day: '2-digit'
    });
    const month = date.toLocaleDateString('en-US', {
        month: '2-digit'
    });
    const year = date.toLocaleDateString('en-US', {
        year: 'numeric'
    });
    return `${month}-${day}-${year}`;
};

const validateForm = () => {
    if (!input.value) {
        return form.reportValidity();
    }

    let errorMessage = '';
    if (
        !/^\s*\d{2}\s?\/\s?\d{2}\s?\/\s?\d{4}\s+\d{2}\s?:\s?\d{2}\s*$/.test(
            input.value
        )
    ) {
        errorMessage = 'Please match the requested format: MM/DD/YYYY hh:mm';
    } else {
        const datePortion = input.value.match(
            /\d{2}\s?\/\s?\d{2}\s?\/\s?\d{4}/
        )?.[0];
        const timePortion = input.value.match(/\d{2}\s?:\s?\d{2}/)?.[0];

        if (!datePortion || !timePortion) {
            throw new Error('unexepected');
        }

        const parsedDate = Date.parse(datePortion.replaceAll(' ', ''));

        if (isNaN(parsedDate)) {
            errorMessage = 'Date is not valid';
        } else {
            const parsedTime = Date.parse(
                `01/01/2024 ${timePortion.replaceAll(' ', '')}`
            );

            if (isNaN(parsedTime)) {
                errorMessage = 'Time is not valid';
            }
        }
    }

    if (errorMessage) {
        input.setCustomValidity(errorMessage);
    }

    return form.reportValidity();
};

const writeTable = (dateArr) => {
    if (!Array.isArray(dateArr) || dateArr.length !== 5) {
        throw new Error('invalid argument supplied to writeTable');
    }

    const table = document.querySelector('table');
    if (!table) {
        throw new Error('table not found');
    }
    table.classList.add('striped');

    const cells = document.querySelectorAll('td:first-of-type');
    if (cells.length !== 5) {
        throw new Error('cells not found');
    }

    Array.from(cells).forEach((cell, cellIndex) => {
        const val1 = dateArr[cellIndex];
        const val2 = cellIndex < 2 ? 'Past' : 'Future';
        cell.innerHTML = `<span data-number="${val1}" class="number">&nbsp;</span>`;
        if (!cell.nextElementSibling) {
            throw new Error('sibling not found');
        }
        cell.nextElementSibling.innerHTML = `<span data-number="${val2}" class="number">&nbsp;</span>`;
    });
};

const resetTable = () => {
    const table = document.querySelector('table');
    if (!table) {
        throw new Error('table not found');
    }
    table.classList.remove('striped');

    const cells = document.querySelectorAll('td:first-of-type');
    if (cells.length !== 5) {
        throw new Error('cells not found');
    }

    Array.from(cells).forEach((cell) => {
        cell.innerHTML = '';
        if (!cell.nextElementSibling) {
            throw new Error('sibling not found');
        }
        cell.nextElementSibling.innerHTML = '';
    });
};

input.addEventListener('input', () => {
    input.setCustomValidity('');
});

form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!validateForm()) {
        resetTable();
        return;
    }

    const enteredValue = input.value;
    const enteredDate = enteredValue ? parseDateStr(enteredValue) : new Date();

    let startDate = cloneDate(enteredDate);
    startDate.setDate(enteredDate.getDate() - 7);

    const drawDates = [];
    for (let n = 0; n < 5; n++) {
        const nextDraw = getNextLottoDraw(startDate);
        drawDates.push(formatDrawDate(nextDraw));
        startDate = nextDraw;
    }

    writeTable(drawDates);
});