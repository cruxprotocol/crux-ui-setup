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
        }
    }

    password.input.on('keyup', (e) => {
        if (e.target.value && e.target.value.length > 0) {
            let passphrase = e.target.value;
            if (password.validation.isValid(passphrase)) {
                if (!password.validation.containsId(passphrase)) {
                    if (password.validation.hasDigit(passphrase)) {
                        if (password.validation.hasLowerCase(passphrase)) {
                            if (password.validation.hasUpperCase(passphrase)) {
                                if (password.validation.hasSpecialCharacter(passphrase)) {
                                    password.clearAllError();
                                } else {
                                    password.displayError('Password must be have atleast one of following special characters !,#,$,%,&,?,@ are allowed');
                                }
                            } else {
                                password.displayError('Password must be have atleast one uppercase letter');
                            }
                        } else {
                            password.displayError('Password must be have atleast one lowercase letter');
                        }
                    } else {
                        password.displayError('Password must be have atleast one number');
                    }
                } else {
                    password.displayError('Password must be different from CruxPay ID');
                }
            } else {
                password.displayError('Minimum length required is 8. Only following special characters !,#,$,%,&,?,@ are allowed');
            }
        }
    })
});