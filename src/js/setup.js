$(document).ready(function () {
    const textFields = document.querySelectorAll(".mdc-text-field");
    for (const textField of textFields) {
        mdc.textField.MDCTextField.attachTo(textField);
    }

    const cruxpayId = {
        input: $('#cruxpayId'),
        inputParent: $('.cruxpay-id__container'),
        helperText: $('#cruxpay-id__helper-text'),
        parentContainer: $('.cruxpay-id__container').parent()
    }
    
    cruxpayId.input.on('keyup', (e) => {
        if (e.target.value && e.target.value.length > 0) {
            isUserIdAvailable(e.target.value)
        }
    })
    function isUserIdAvailable(id) {
        $.ajax({
            type: "GET",
            url: `https://167.71.234.131:3000/status/${id}`,
            success: function (response) {
                cruxpayId.helperText.removeClass('cruxpay-id__helper-text--success');
                cruxpayId.inputParent.addClass('mdc-text-field--invalid');
                cruxpayId.parentContainer.addClass('has-error');
                cruxpayId.helperText.html(`${id} is unavailable`);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (xhr.status == 404) {
                    cruxpayId.helperText.addClass('cruxpay-id__helper-text--success');
                    cruxpayId.inputParent.removeClass('mdc-text-field--invalid');
                    cruxpayId.parentContainer.removeClass('has-error');
                    cruxpayId.helperText.html(`${id} is available`);
                }
            }
        });
    }
});
