$(document).ready(function () {
    let appCtrl = new function () {
        this.availableStates = ['registration', 'customisation'];
        this.registration = {
            el: $('#registration'),
            hide() {
                this.el.addClass('cs-hide');
            },
            show() {
                this.el.removeClass('cs-hide');
            }
        };
        this.customisation = {
            el: $('#customisation'),
            hide() {
                this.el.addClass('cs-hide');
            },
            show() {
                this.el.removeClass('cs-hide');
            }
        };
        this.renderState = (state) => {
            if (this.availableStates.includes(state)) {
                for (let thisState of this.availableStates) {
                    if (thisState === state) {
                        this[thisState].show();
                    } else {
                        this[thisState].hide();
                    }
                }
            }
        }
    }

    appCtrl.renderState('customisation') //FIXME


    let currentInput;
    window.addEventListener('message', function (event) {
        currentInput = JSON.parse(event.data);
        console.log('currentInput', currentInput);
        if (currentInput && currentInput.payIDName) {
            appCtrl.renderState('registration')
        } else {
            appCtrl.renderState('customisation')
        }
    }, false);

    /*******************************
            Registration
    ********************************/

    const textFields = document.querySelectorAll(".mdc-text-field");
    for (const textField of textFields) {
        mdc.textField.MDCTextField.attachTo(textField);
    }

    const cruxpayId = {
        input: $('#cruxpayId'),
        inputParent: $('.cruxpay-id__container'),
        helperText: $('#cruxpay-id__helper-text'),
        parentContainer: $('.cruxpay-id__container').parent(),
        displayError(message) {
            this.helperText.removeClass('helper-text--success');
            this.inputParent.addClass('mdc-text-field--invalid');
            this.parentContainer.addClass('has-error');
            this.helperText.html(message);
        },
        displaySuccess(message) {
            cruxpayId.inputParent.removeClass('mdc-text-field--invalid');
            cruxpayId.helperText.addClass('helper-text--success');
            cruxpayId.parentContainer.removeClass('has-error');
            cruxpayId.helperText.html(message);
        },
        displayHelpText(message) {
            cruxpayId.helperText.removeClass('helper-text--success');
            cruxpayId.inputParent.removeClass('mdc-text-field--invalid');
            cruxpayId.parentContainer.removeClass('has-error');
            cruxpayId.helperText.html(message);
        },
        getId() {
            return this.input.val();
        },
        isValid: false
    }

    let timer = null;
    cruxpayId.input.on('keyup', (e) => {
        cruxpayId.displayHelpText(`Checking availability`);
        cruxpayId.isValid = false;
        clearTimeout(timer);
        timer = setTimeout(function () {
            if (e.target.value && e.target.value.length > 0) {
                isUserIdAvailable(e.target.value)
            }
        }, 500)
    })
    function isUserIdAvailable(id) {
        $.ajax({
            type: "GET",
            url: `https://167.71.234.131:3000/status/${id}`,
            success: function (response) {
                cruxpayId.isValid = false;
                cruxpayId.displayError(`${id} is unavailable`);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (xhr.status == 404) {
                    cruxpayId.isValid = true;
                    cruxpayId.displaySuccess(`${id} is available`);
                }
            }
        });
    }

    const password = {
        input: $('#cruxpayPassword'),
        helperText: $('#cruxpay-password__helper-text'),
        inputParent: $('.cruxpay-password__container'),
        parentContainer: $('.cruxpay-password__container').parent(),
        isValid: false,
        validation: {
            isValid(p) {
                const re = /^[a-zA-Z0-9$@!#^&%_-]{8,50}$/;
                return re.test(String(p).toLowerCase());
            },
            containsId(p) {
                return p === cruxpayId.input.val();
            },
            hasDigit(p) {
                const re = /[0-9]/;
                return re.test(p);
            },
            hasLowerCase(p) {
                const re = /[a-z]/;
                return re.test(p);
            },
            hasUpperCase(p) {
                const re = /[A-Z]/;
                return re.test(p);
            },
            hasSpecialCharacter(p) {
                const re = /(?=.*[!#$%&?@"])/;
                return re.test(p);
            }
        },
        displayError(message) {
            this.helperText.removeClass('helper-text--success');
            this.inputParent.addClass('mdc-text-field--invalid');
            this.parentContainer.addClass('has-error');
            this.helperText.html(message);
        },
        clearAllError() {
            this.helperText.addClass('helper-text--success');
            this.inputParent.removeClass('mdc-text-field--invalid');
            this.parentContainer.removeClass('has-error');
            this.helperText.html('');
        },
        toggleValidationBlock(state) {
            if (state) {
                $('.validation-rules').css('opacity', 1);
            } else {
                $('.validation-rules').css('opacity', 0);
            }

        },
        setValidation(name, state) {
            let validationEl = $(`#validation-${name}`);
            this.isValid = state;
            if (validationEl && validationEl.length > 0) {
                if (state) {
                    validationEl.removeClass('rule-isInvalid');
                    validationEl.addClass('rule-isValid');
                } else {
                    validationEl.addClass('rule-isInvalid');
                    validationEl.removeClass('rule-isValid');
                }
            }
        },
        getPassword() {
            return this.input.val();
        },
        runValidations(passphrase) {
            if (this.validation.isValid(passphrase)) {
                this.setValidation('charLen', true);
            } else {
                this.setValidation('charLen', false);
                this.displayError('Minimum length required is 8. Only following special characters !,#,$,%,&,?,@ are allowed');
            }

            if (!this.validation.containsId(passphrase)) {
                this.setValidation('sameAsId', true);
            } else {
                this.setValidation('sameAsId', false);
                this.displayError('Password must be different from CruxPay ID');
            }

            if (this.validation.hasDigit(passphrase)) {
                this.setValidation('digit', true);
            } else {
                this.setValidation('digit', false);
                this.displayError('Password must be have atleast one number');
            }

            if (this.validation.hasLowerCase(passphrase)) {
                this.setValidation('lowercase', true);
            } else {
                this.setValidation('lowercase', false);
                this.displayError('Password must be have atleast one lowercase letter');
            }

            if (this.validation.hasUpperCase(passphrase)) {
                this.setValidation('uppercase', true);
            } else {
                this.setValidation('uppercase', false);
                this.displayError('Password must be have atleast one uppercase letter');
            }

            if (this.validation.hasSpecialCharacter(passphrase)) {
                this.setValidation('specialCharater', true);
                // this.toggleValidationBlock(false);
                this.clearAllError();
            } else {
                this.setValidation('specialCharater', false);
                this.displayError('Password must be have atleast one of following special characters !,#,$,%,&,?,@ are allowed');
            }
        }
    }

    password.input.on('keyup', (e) => {
        password.toggleValidationBlock(true);
        password.runValidations(password.getPassword());
    })

    $('#createId').on('click', createNewID);
    function createNewID() {
        if (cruxpayId.isValid && password.isValid) {
            let inputPayIDName = cruxpayId.getId();
            let inputPayIDPass = password.getPassword();
            // TODO: Add loader to button

            let registerMessage = {
                type: 'createNew',
                data: {
                    newPayIDName: inputPayIDName,
                    newPayIDPass: inputPayIDPass
                }
            };

            if (currentInput.experience == 'iframe') {
                window.parent.postMessage(JSON.stringify(registerMessage), '*');
            } else {
                window.opener.postMessage(JSON.stringify(registerMessage), '*');
            }
        } else {
            if (!password.isValid) {
                password.runValidations(password.getPassword());
            }
            if (!cruxpayId.isValid) {
                cruxpayId.displayError(
                    cruxpayId.getId() && cruxpayId.getId().length > 0 ?
                        `${cruxpayId.getId()} is unavailable` :
                        'cruxpay id is needed'
                );
            }
        }
    }



    /*******************************
            Customisation
    ********************************/
    let currency = {
        container: $('#currencyContainer'),
        list : [{
            name: 'Bitcoin',
            symbol: 'btc',
            img: 'https://files.coinswitch.co/public/coins/btc.png',
            selected: true
        },{
            name: 'Ethereum',
            symbol: 'eth',
            img: 'https://files.coinswitch.co/public/coins/eth.png',
            selected: true
        },
        {
            name: 'Litecoin',
            symbol: 'ltc',
            img: 'https://files.coinswitch.co/public/coins/ltc.png',
            selected: false
        }],
        renderCurList(curlist){
            let template = '';
            for(let cur of curlist){
                template += this.renderCur(cur);
            }
            $(this.container).html(template);
        },
        renderCur({name, symbol, img, selected}){
            return `
            <div class="customisation__currency ${selected ? 'customisation__currency--isSelected' : ''} ">
                <img class="customisation__currency-logo" src="${img}" />
                <div class="customisation__currency-name">${name}</div>
                <div class="customisation__currency-symbol">${symbol.toUpperCase()}</div>
            </div>
            `
        }
    }

    currency.renderCurList(currency.list); //FIXME
});