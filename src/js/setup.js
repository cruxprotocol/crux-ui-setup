$(document).ready(function () {
    let currentInput;
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
        this.renderApp = (currentInput) => {
            if (currentInput && currentInput.payIDName) {
                this.renderState('customisation');
                currency.init({
                    payIDName: currentInput.payIDName,
                    availableCurrencies: currentInput.availableCurrencies,
                    publicAddressCurrencies: currentInput.publicAddressCurrencies,
                    allCurrencies: currentInput.assetList && currentInput.assetList.length > 0 ? curlistAdapter(currentInput.assetList) : []
                });
            } else {
                this.renderState('registration')
            }
        }
    }

    let loader = {
        show(el, handlerFn) {
            el.attr('disabled', 'true');
            el.off('click', handlerFn);
        },
        hide(el, handlerFn) {
            el.removeAttr('disabled', 'false');
            el.on('click', handlerFn);
        }
    }

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
            loader.show($('#createId'), createNewID);
            let inputPayIDName = cruxpayId.getId();
            let inputPayIDPass = password.getPassword();
            appCtrl.data = {
                newPayIDName: inputPayIDName,
                newPayIDPass: inputPayIDPass
            }
            currentInput.payIDName = inputPayIDName;
            appCtrl.renderApp(currentInput);
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
        selectedCurCintainer: $('#selectedCurContainer'),
        search: $('#cruxSearchCur'),
        selectedRadio: 'custom',
        radioContainer: $('.customisation__radio-select'),
        init({ payIDName, availableCurrencies, publicAddressCurrencies, allCurrencies}) {
            $('#cruxpayIdName').html(payIDName);
            let currenciesToRender = [];
            for (let currency of allCurrencies) {
                if (availableCurrencies.includes(currency.symbol.toUpperCase())) {
                    if (publicAddressCurrencies.includes(currency.symbol.toUpperCase())) {
                        currency.selected = true;
                    } else {
                        currency.selected = false;
                    }
                    currenciesToRender.push(currency);
                }
            }

            this.list = currenciesToRender;

            this.renderRadios();
            this.search.on('keyup', (event) => {
                let filteredList = this.filter(this.list, event.target.value);
                this.renderCurList(filteredList);
            })

            this.renderCurList(this.list);
            this.renderSelectedCurPills(this.list);

        },
        availableRadios: [{
            id: 'radio-selectCustom',
            value: 'custom',
            name: 'Custom'
        }, {
            id: 'radio-selectAll',
            value: 'all',
            name: 'All'
        }, {
            id: 'radio-selectPopular',
            value: 'popular',
            name: 'Popular'
        }, {
            id: 'radio-selectNone',
            value: 'none',
            name: 'None'
        }],
        renderCurList(curlist) {
            let template = '';
            for (let cur of curlist) {
                template += this.renderCur(cur);
            }
            $(this.container).html(template);
            this.bindCheckboxEvents();
        },
        renderCur({ name, symbol, img, selected }) {
            return `
            <div class="customisation__currency ${selected ? 'customisation__currency--isSelected' : ''} ">
                <div class="mdc-form-field">
                    <div class="mdc-checkbox">
                        <input
                            data-symbol="${symbol}"
                            type="checkbox"
                            class="mdc-checkbox__native-control"
                            id="checkbox-${symbol}"
                            ${selected ? 'checked' : ''}
                        />
                        <div class="mdc-checkbox__background">
                            <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                            <path
                                class="mdc-checkbox__checkmark-path"
                                fill="none"
                                d="M1.73,12.91 8.1,19.28 22.79,4.59"
                            />
                            </svg>
                            <div class="mdc-checkbox__mixedmark"></div>
                        </div>
                    </div>
                    <label for="checkbox-${symbol}" class="customisation__checkbox-label">
                        <img class="customisation__currency-logo" src="${img}" />
                        <div class="customisation__currency-name">${name}</div>
                    </label>
                </div>
                <div class="customisation__currency-symbol">${symbol.toUpperCase()}</div>
            </div>
            `
        },
        renderSelectedCurPills(curlist) {
            let template = '';
            for (let cur of curlist) {
                if (cur.selected) template += this.renderSelectedPill(cur);
            }
            $(this.selectedCurCintainer).html(template);
            this.bindPillEvents();
        },
        renderSelectedPill({ symbol }) {
            return `
                <div class="selected-currency__pill">
                    <strong>${symbol.toUpperCase()}</strong>
                    <i class="material-icons" data-symbol="${symbol}">clear</i>
                </div>
            `
        },
        renderRadios() {
            let template = '';
            for (let radio of this.availableRadios) {
                template += this.renderRadioEl(radio);
            }
            $(this.radioContainer).html(template);
            this.bindRadioEvents();
        },
        renderRadioEl({ id, value, name }) {
            return `
                <div class="mdc-form-field">
                    <div class="mdc-radio mdc-custom-radio">
                        <input class="mdc-radio__native-control" type="radio" id="${id}" name="radios" value="${value}">
                        <div class="mdc-radio__background">
                            <div class="mdc-radio__outer-circle"></div>
                            <div class="mdc-radio__inner-circle"></div>
                        </div>
                    </div>
                    <label for="${id}">${name}</label>
                </div>
            `
        },
        filter(list, query) {
            let searchString = query || '';
            try {
                let searchRegex = new RegExp(searchString, 'ig');
                return list.filter(function (coin) {
                    return coin.name.match(searchRegex) || coin.symbol.match(searchRegex);
                });
            } catch (e) {
                return [];
            }
        },
        bindCheckboxEvents() {
            $('.mdc-checkbox__native-control').on('click', (event) => {
                let el = $(event.target);
                for (let index in this.list) {
                    let coin = this.list[index];
                    if (coin.symbol === el.data('symbol')) {
                        this.list[index].selected = el.is(':checked')
                    }
                }

                $('#radio-selectCustom').prop('checked', 'true');
                this.renderSelectedCurPills(this.list);
            })
        },
        bindPillEvents() {
            $('.selected-currency__pill').on('click', (event) => {
                let el = $(event.target);
                for (let index in this.list) {
                    let coin = this.list[index];
                    if (coin.symbol === el.data('symbol')) {
                        this.list[index].selected = false
                    }
                }
                $('#radio-selectCustom').prop('checked', 'true');
                this.renderCurList(this.list);
                this.renderSelectedCurPills(this.list);
            })
        },
        bindRadioEvents() {
            $('.mdc-radio__native-control').on('click', (event) => {
                switch (event.target.value) {
                    case 'custom':
                        this.selectedRadio = 'custom';
                        break;
                    case 'popular':
                        let popularCoins = ['btc', 'eth', 'xrp', 'bch', 'ltc'];
                        for (let index in this.list) {
                            let coin = this.list[index];
                            if (popularCoins.includes(coin.symbol)) {
                                this.list[index].selected = true;
                            } else {
                                this.list[index].selected = false;
                            }
                        }
                        this.renderCurList(this.list);
                        this.renderSelectedCurPills(this.list);
                        this.selectedRadio = 'popular';
                        break;
                    case 'all':
                        for (let index in this.list) {
                            this.list[index].selected = true;
                        }
                        this.renderCurList(this.list);
                        this.renderSelectedCurPills(this.list);
                        this.selectedRadio = 'all';
                        break;
                    case 'none':
                        for (let index in this.list) {
                            this.list[index].selected = false;
                        }
                        this.renderCurList(this.list);
                        this.renderSelectedCurPills(this.list);
                        this.selectedRadio = 'none';
                        break;
                }
            })
            let radios = $('.mdc-radio__native-control');
            for (let radio of radios) {
                if (this.selectedRadio === radio.value) {
                    radio.setAttribute('checked', 'true');
                }
            }
        }
    }

    function handleCustomisation() {
        loader.show($('#updateCustomization'), handleCustomisation);
        let checkedCurrencies = [];
        for (let cur of currency.list) {
            if (cur.selected) {
                checkedCurrencies.push(cur.symbol.toUpperCase())
            }
        }

        if (appCtrl.isExistingAccount) {
            let existingMessage = {
                type: 'editExisting',
                data: {
                    checkedCurrencies: checkedCurrencies
                }
            };
            existingMessage = JSON.stringify(existingMessage)
            existingMessage = OpenPay.Encryption.eciesEncryptString(existingMessage, window.encryptionKey)
            window.parent.postMessage(existingMessage, '*');
        } else {
            let registerMessage = {
                type: 'createNew',
                data: {
                    newPayIDName: appCtrl.data.newPayIDName,
                    newPayIDPass: appCtrl.data.newPayIDPass,
                    checkedCurrencies: checkedCurrencies
                }
            };
            registerMessage = OpenPay.Encryption.eciesEncryptString(JSON.stringify(registerMessage), window.encryptionKey)
            window.parent.postMessage(registerMessage, '*');
        }
    }

    $('#updateCustomization').on('click', handleCustomisation);

    function handleCloseSetup() {
        let closeIframeMessage = {
            type: 'closeIframe'
        }
        closeIframeMessage = OpenPay.Encryption.eciesEncryptString(JSON.stringify(closeIframeMessage), window.encryptionKey)
        window.parent.postMessage(closeIframeMessage, '*')
    }
    $('#closeSetup').on('click', handleCloseSetup);

    function curlistAdapter(list){
        return list.map((e) => {
            return {
                name: e.name,
                symbol: e.symbol,
                img: e.image_sm_url
            }
        })
    }

    /**** FIXME ****/
    /*let allCurrencies = [{ "asset_id": "8dd939ef-b9d2-46f0-8796-4bd8dbaeef1b", "name": "Litecoin", "symbol": "ltc", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/litecoin.png" }, { "asset_id": "508b8f73-4b06-453e-8151-78cb8cfc3bc9", "name": "Ethereum", "symbol": "eth", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/ether.png" }, { "asset_id": "9a267cc3-0e72-4db5-930c-c60a74d64c55", "name": "Basic Attention Token", "symbol": "bat", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/bat.png" }, { "asset_id": "490f7648-7fc1-4f0d-aa23-e08185daf8a5", "name": "DigiByte", "symbol": "dgb", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/digibyte.png" }, { "asset_id": "77a880a0-3443-4eef-8500-bdc8dcdd3370", "name": "Dai", "symbol": "dai", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/dai.png" }, { "asset_id": "902d4bde-f877-486e-813e-135920cc7f33", "name": "0x", "symbol": "zrx", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins/0x.png" }, { "asset_id": "0999c959-f691-4553-b461-b88ea5032e0c", "name": "Monaco", "symbol": "mco", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/monaco.png" }, { "asset_id": "fecfeb26-e612-4df4-aed7-bd4ad0194936", "name": "Civic", "symbol": "cvc", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/civic.png" }, { "asset_id": "20d57d7d-3cc1-428a-ae90-09fb9c5168f5", "name": "Decred", "symbol": "dcr", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/decred.png" }, { "asset_id": "9d796569-0faf-4e4a-b581-676fab3433d9", "name": "DigixDAO", "symbol": "dgd", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/digixdao.png" }, { "asset_id": "d133dd13-a791-4c2b-9c14-b4c8532f6b91", "name": "district0x", "symbol": "dnt", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/district0x.png" }, { "asset_id": "9dbdc727-de68-4f2a-8956-04a38ed71ca5", "name": "Tron", "symbol": "trx", "image_sm_url": "" }, { "asset_id": "1d6e1a99-1e77-41e1-9ebb-0e216faa166a", "name": "Bitcoin", "symbol": "btc", "image_sm_url": "" }, { "asset_id": "b33adc7a-beb9-421f-95d6-d495dc549f79", "name": "Lisk", "symbol": "lsk", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/lisk_v2.png" }, { "asset_id": "3e92f1b6-693c-4654-9b9b-938582d64e4f", "name": "Waves", "symbol": "waves", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/waves.png" }, { "asset_id": "2794e4c6-6bec-45da-b4a6-74996cdad79a", "name": "Golem", "symbol": "gnt", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/golem.png" }, { "asset_id": "86a3f3fa-d616-4f40-b46c-09c49c0187e1", "name": "OmiseGO", "symbol": "omg", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/omisego.png" }, { "asset_id": "8960c3e7-c953-4db1-8497-34b82d9ce322", "name": "Augur", "symbol": "rep", "image_sm_url": "https://s3.ap-south-1.amazonaws.com/crypto-exchange/coins-sm/augur.png" }]
    currentInput = {
        payIDName: 'amitasaurus.exodus.id', //
        availableCurrencies: ['BTC', 'ETH', 'TRX', 'EOS', 'LTC'],
        publicAddressCurrencies: ['BTC', 'EOS', 'LTC'],
        assetList: allCurrencies
    }
    appCtrl.renderApp(currentInput);*/
    /**** End of FIXME ****/

    /*window.addEventListener('message', function (event) {
        currentInput = JSON.parse(event.data);
        appCtrl.isExistingAccount = currentInput.payIDName ? true : false;
        if(currentInput.type == 'register'){
            if(currentInput.encryptionKey){
                window.encryptionKey = currentInput.encryptionKey;
            }
        }
        appCtrl.renderApp(currentInput);
    }, false);*/

    function datalookup(){
        if(window.walletInfo){
            currentInput = window.walletInfo
            appCtrl.isExistingAccount = currentInput.payIDName ? true : false;
            appCtrl.renderApp(currentInput);
        }else{
            setTimeout(() => {
                datalookup();
            }, 500);
        }
    }
    datalookup();

    // window.addEventListener('register', function(event){
    //     currentInput = JSON.parse(event.data);
    // }, false);

});




