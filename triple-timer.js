const els = [];
const timers = [];

function updateText(el, timer) {
    const timeValues = timer.getTimeValues();
    let format = ['minutes', 'seconds'];
    if (timeValues.days > 0) {
        format = ['days', 'hours', 'minutes', 'seconds'];
    }
    else if (timeValues.hours > 0) {
        format = ['hours', 'minutes', 'seconds'];
    }
    el.innerHTML = timer.getTimeValues().toString(format);
}

function setActive(el, timer) {
    if (el.classList.contains('active')) {
        el.classList.remove('active');
        timer.stop();
    } else {
        el.classList.add('active');
        timer.start();
    }
    for (elLoop of els) {
        if (elLoop !== el) {
            elLoop.classList.remove('active');
        }
    }
    for (timerLoop of timers) {
        if (timerLoop !== timer) {
            timerLoop.pause();
        }
    }
}

document.querySelectorAll('.timer').forEach(el => {
    els.push(el.parentElement);
    const timer = new easytimer.Timer({precision: 'secondTenths'});
    timer.addEventListener('secondsUpdated', () => updateText(el, timer));
    timers.push(timer);
    el.parentElement.addEventListener('click', () => setActive(el.parentElement, timer));
    updateText(el, timer);
});