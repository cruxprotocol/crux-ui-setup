
//function OpenPayIframe() {
//    return this
//}
//
//
//OpenPayIframe.prototype = {
//
//    create: function() {
//        var iframe = window.document.createElement("iframe");
//        iframe.setAttribute("style", "opacity: 1; height: 100%; position: relative; background: none; display: block; border: 0 none transparent; margin: 0px; padding: 0px; z-index: 2;");
//        iframe.setAttribute("src", "https://s3-ap-southeast-1.amazonaws.com/files.coinswitch.co/openpay-setup/index.html");
//        iframe.setAttribute("id", "frame");
//        iframe.frameBorder = 0;
//        iframe.style.width = 100 + "%";
//        iframe.style.height = 100 + "%";
//        return  iframe
//    },
//
//    postMessage: function(message) {
//        message = JSON.stringify(message)
//        this.contentWindow.postMessage(message, "*")
//    },
//
//    makeMessage: function() {
//        var email = this.openPayOptions.email || 'testuser@rocks.com'
//        return {
//            type: 'email',
//            message: email
//        }
//    },
//
//    onload: function() {
//        console.log('called onload!');
//        this.postMessage(this.makeMessage())
//    }
//
//}

function OpenPay(options) {
    this.createOpenPayIframe(options)
    return this.parseOptions(options)
}

OpenPay.prototype = {

    createOpenPayIframe: function() {
        if (!this.el) {
            this.el = window.document.createElement("iframe");
            this.el.setAttribute("style", "opacity: 1; height: 100%; position: relative; background: none; display: block; border: 0 none transparent; margin: 0px; padding: 0px; z-index: 2;");
            this.el.setAttribute("src", "https://s3-ap-southeast-1.amazonaws.com/files.coinswitch.co/openpay-setup/index.html");
            this.el.setAttribute("id", "frame");
            this.el.frameBorder = 0;
            this.el.style.width = 100 + "%";
            this.el.style.height = 100 + "%";
            this.el.postMessage = this.postMessage
            this.el.makeMessage = this.makeMessage
            this.el.onload = this.onload
        }
        return this.el
    },

    parseOptions: function(options) {
        // TODO: add validation
        this.openPayOptions = options
        console.log('called parseOptions!');
    },

    postMessage: function(message) {
        message = JSON.stringify(message)
        this.contentWindow.postMessage(message, "*")
    },

    makeMessage: function(type) {
        if (type == 'register') {
            // the below item can be prototype
           return {
                type: 'register',
                payIDName: this.openPayOptions.payIDName,
                publicKey: this.openPayOptions.publicKey,
            }
        }
    },

    onload: function() {
        console.log('called onload!');
        this.postMessage(this.makeMessage('register'))
    },

    sdkHandler: function(data) {
        // TODO: add sdk wala logic here
        var type = data.type;
        if (type == 'register') {
            console.log(data);
        }
    },

    maskDataForWallet: function (data) {
        // manipulate to field that you want to send to wallet who called .open()
        // right now we pass everything
        return data
    },

    addPostMessageListeners: function () {
        var walletHandler = this.openPayOptions.handler;
        var sdkHandler = this.sdkHandler;
        var maskDataForWallet = this.maskDataForWallet;
        window.addEventListener('message', function (event) {
            var data = JSON.parse(event.data);
            sdkHandler(data);
            var dataForWallet = maskDataForWallet(data);
            walletHandler(dataForWallet);
        });
    },

    open: function() {
        console.log('called open!');
        this.el.openPayOptions = this.openPayOptions;
        document.getElementById('coinswitch-container').appendChild(this.el);
        // this.onload();
        this.addPostMessageListeners();
    }
}
