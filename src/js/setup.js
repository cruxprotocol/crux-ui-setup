$(document).ready(function () {
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
        }
    }

    let timer = null;
    cruxpayId.input.on('keyup', (e) => {
        cruxpayId.displayHelpText(`Checking availability`);
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
                cruxpayId.displayError(`${id} is unavailable`);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (xhr.status == 404) {
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
            if (validationEl && validationEl.length > 0) {
                if (state) {
                    validationEl.removeClass('rule-isInvalid');
                    validationEl.addClass('rule-isValid');
                } else {
                    validationEl.addClass('rule-isInvalid');
                    validationEl.removeClass('rule-isValid');
                }
            }
        }
    }

    password.input.on('keyup', (e) => {
        /* TODO(IMP): Clean this code and run validations in parallel */
        password.toggleValidationBlock(true);
        if (e.target.value && e.target.value.length > 0) {
            let passphrase = e.target.value;
            if (password.validation.isValid(passphrase)) {
                password.setValidation('charLen', true);
                if (!password.validation.containsId(passphrase)) {
                    password.setValidation('sameAsId', true);
                    if (password.validation.hasDigit(passphrase)) {
                        password.setValidation('digit', true);
                        if (password.validation.hasLowerCase(passphrase)) {
                            password.setValidation('lowercase', true);
                            if (password.validation.hasUpperCase(passphrase)) {
                                password.setValidation('uppercase', true);
                                if (password.validation.hasSpecialCharacter(passphrase)) {
                                    password.setValidation('specialCharater', true);
                                    password.toggleValidationBlock(false);
                                    password.clearAllError();
                                } else {
                                    password.setValidation('specialCharater', false);
                                    password.displayError('Password must be have atleast one of following special characters !,#,$,%,&,?,@ are allowed');
                                }
                            } else {
                                password.setValidation('uppercase', false);
                                password.displayError('Password must be have atleast one uppercase letter');
                            }
                        } else {
                            password.setValidation('lowercase', false);
                            password.displayError('Password must be have atleast one lowercase letter');
                        }
                    } else {
                        password.setValidation('digit', false);
                        password.displayError('Password must be have atleast one number');
                    }
                } else {
                    password.setValidation('sameAsId', false);
                    password.displayError('Password must be different from CruxPay ID');
                }
            } else {
                password.setValidation('charLen', false);
                password.displayError('Minimum length required is 8. Only following special characters !,#,$,%,&,?,@ are allowed');
            }
        }
    })
});