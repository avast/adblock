(function () {
    document.querySelectorAll('input[type="range"]').forEach(function (item) {
        $(item).bind('input', function (e) {
            var input = e.target,
                sliderWrapper = input.closest('.slider-wrapper'),
                arrow = document.querySelector('.slider-wrapper .arrow'),
                value = (input.value - input.min) / (input.max - input.min);

            if (input.value > input.defaultValue) {
                input.setAttribute('data-direction', 'right');
            } else {
                input.setAttribute('data-direction', 'left');
            }

            if (input.value === '50') {
                input.removeAttribute('data-direction');
            }

            input.setAttribute('data-pass', (input.value >= 50).toString());

            input.setAttribute('value', input.value);
            input.defaultValue = input.value;
            arrow.style.left = input.value / 100 * (131 - 18) + "px";

            if (input.value < 25) {
                input.setAttribute('data-value', '0');
                sliderWrapper.setAttribute('data-value', '0');
            } else if (input.value >= 25 && input.value < 75) {
                input.setAttribute('data-value', '50');
                sliderWrapper.setAttribute('data-value', '50');
            } else if (input.value >= 75) {
                input.setAttribute('data-value', '100');
                sliderWrapper.setAttribute('data-value', '100');
            }

            input.style.backgroundImage = [
                '-webkit-gradient(',
                'linear, ',
                'left top, ',
                'right top, ',
                'color-stop(' + value + ', #0cb754), ',
                'color-stop(' + value + ', #e4e4e4)',
                ')'
            ].join('');
        });

        $(item).bind('change', function (e) {
            var value = e.target.value,
                closest = Math.round(value / 50) * 50,
                event = new MouseEvent('click');

            document.querySelectorAll('[name="' + item.name + '"]').forEach(function (elem) {
                Array.prototype.forEach.call(elem.parentNode.getElementsByClassName('dot'), function (dot) {
                    if (+dot.getAttribute('data-value') === closest) {
                        dot.dispatchEvent(event);
                    }
                });
            });
        });

        Array.prototype.forEach.call(item.parentNode.getElementsByClassName('dot'), function (dot) {
            dot.addEventListener('click', function (e) {
                var value = +e.target.getAttribute('data-value'),
                    event = new Event('input');

                var process = setInterval(function () {
                    var inputValue = +item.value;

                    if (inputValue < value) {
                        item.stepUp();
                    } else if (inputValue > value) {
                        item.stepDown();
                    } else if (inputValue === value) {
                        clearInterval(process);
                        item.dispatchEvent(event);
                    }
                }, 100 / Math.abs(value - +item.value));
            });
        });
    });

    var updateUI = function(mode) {
        $('input[type="range"]').val(mode * 50).trigger('input');
        $('.slider-wrapper').css('opacity', 1);
    };
    vAPI.messaging.send('extraSetting', {what: 'getMode'}, function (request) {
        updateUI(request.mode);
    });
    vAPI.messaging.addChannelListener('extraSetting', function (request) {
        if (request.what === 'extraUpdateMode') {
            updateUI(request.mode);
        }
    });
})();