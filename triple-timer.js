class Rink {
    #focussedSection = null;
    #sections = [];
    #periods = [];
    activePeriod = 1;

    constructor(sections) {
        sections.forEach((section, index) => {
            const timerElement = new TimerElement(section.parentElement);
            this.#sections.push(timerElement);
            section.parentElement.addEventListener('click', () => this.focusSection(index));
        });
        // a hockey game has 3 periods (excluding overtime)
        this.addPeriod();
        this.addPeriod();
        this.addPeriod();
        this.switchPeriod(1);
    }

    focusSection(index) {
        const section = this.#sections[index];
        if (section === this.#focussedSection) {
            section.stop();
            this.#focussedSection = null;
            return;
        }
        if (this.#focussedSection !== null) {
            this.#focussedSection.stop();
        }
        if (section !== undefined) {
            section.start();
            this.#focussedSection = section;
        }
    }

    unfocusAll() {
        if (this.#focussedSection !== null) {
            this.#focussedSection.stop();
            this.#focussedSection = null;
        }
    }

    switchPeriod(period) {
        this.unfocusAll();
        // periods are 1-indexed
        const periodTimers = this.#periods[period - 1];
        if (periodTimers === undefined) {
            return;
        }
        this.#sections.forEach((timerElement, i) => {
            const timer = periodTimers[i];
            timerElement.timer = timer;
        });
    }

    /**
     * Adds a new period to the game. Use switchPeriod to activate it.
     * @returns {number} The period number of the newly-added period.
     */
    addPeriod() {
        const newTimers = this.#sections.map(timerElement => timerElement.createTimer());
        return this.#periods.push(newTimers);
    }

    /**
     * Returns the number of periods currently in the game.
     * @type {number}
     */
    get periods() {
        return this.#periods.length;
    }

    /**
     * Returns all timer data for exporting.
     * @returns {Array<Array<string>>} An array of periods, each represented as an array of duration strings.
     */
    export() {
        return this.#periods.map(period => {
            return period.map(timer => TimerElement.formatTimeValues(timer.getTimeValues()))
        });
    }
}

class TimerElement {
    #element;
    #timer;

    constructor(element) {
        this.#element = element;
        this.#timer = this.createTimer();
    }

    /**
     * Creates a new timer bound to this element.
     * @returns {easytimer.Timer}
     */
    createTimer() {
        const timer = new easytimer.Timer({ precision: 'secondTenths' });
        timer.addEventListener('secondsUpdated', () => this.updateText());
        return timer;
    }

    stop() {
        this.#element.classList.remove('active');
        this.#timer.pause();
    }

    start() {
        this.#element.classList.add('active');
        this.#timer.start();
    }

    static formatTimeValues(timeValues) {
        let format = ['minutes', 'seconds'];
        if (timeValues.days > 0) {
            format = ['days', 'hours', 'minutes', 'seconds'];
        }
        else if (timeValues.hours > 0) {
            format = ['hours', 'minutes', 'seconds'];
        }
        return timeValues.toString(format);
    }

    updateText() {
        const timeValues = this.#timer.getTimeValues();
        this.#element.innerHTML = TimerElement.formatTimeValues(timeValues);
    }

    /**
     * @type {HTMLElement}
     */
    get element() {
        return this.#element;
    }

    /**
     * @type {easytimer.Timer}
     */
    get timer() {
        return this.#timer;
    }

    /**
     * @param {easytimer.Timer} newTimer
     */
    set timer(newTimer) {
        this.stop();
        this.#timer = newTimer;
        this.updateText();
    }

    /**
     * @type {boolean}
     */
    get active() {
        return this.#timer.isRunning();
    }
}

const rink = new Rink(document.querySelectorAll('.timer'));

class Menu {
    static periodText = document.getElementById("period-text");
    static addOTButton = document.getElementById("add-period");

    static openMenu() {
        document.body.classList.open('menu-open');
    }

    static closeMenu() {
        document.body.classList.remove('menu-open');
    }

    static toggleMenu() {
        document.body.classList.toggle('menu-open');
    }

    static switchPeriod(periodElement) {
        rink.switchPeriod(periodElement.dataset.period);
        Menu.periodText.innerHTML = periodElement.innerHTML;
        Menu.closeMenu();
    }

    static addOT() {
        const periodNumber = rink.addPeriod();
        const otNumber = periodNumber - 3;
        const otButton = document.createElement("button");
        otButton.classList.add("period");
        otButton.dataset.period = periodNumber;
        otButton.innerHTML = `OT${otNumber}`;
        otButton.addEventListener("click", () => Menu.switchPeriod(otButton));
        Menu.addOTButton.before(otButton);
    }

    static async csvExport() {
        let periodHeadings = [];
        document.querySelectorAll(".period").forEach(period => periodHeadings.push(period.innerHTML));
        const timerData = rink.export();
        const csvData = timerData.map((row, i) => [periodHeadings[i], ...row].join(',')).join('\n');
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
        const fileName = (new Date()).toISOString().substring(0, 10);
        saveAs(blob, fileName);
    }
}

document.getElementById("menu-open").addEventListener("click", Menu.toggleMenu);

document.querySelectorAll(".period").forEach(periodElement => {
    periodElement.addEventListener("click", () => Menu.switchPeriod(periodElement));
});

Menu.addOTButton.addEventListener("click", Menu.addOT);

document.getElementById("export").addEventListener("click", Menu.csvExport);
