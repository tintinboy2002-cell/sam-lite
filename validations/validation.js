const niv = require('node-input-validator');
    niv.extend('phoneNumber', (obj) => {
        value = obj.value.match(/\d/g);
        return _.isEmpty(value) ? false : value.length === 10;
    });

    niv.extend('noSpecialChar', (obj) => {
        const specialCharacterRegex = /[!@#$%^&*(),.?":;{}|<>]/g;
        const isValid = specialCharacterRegex.test(obj.value);
        return isValid ? false : true;
    })
    function obj() {
        this.validate = async function (fieldsObj, rulesObj,msgObj={}) {
            const v = new niv.Validator(fieldsObj, rulesObj,msgObj);
            // if (fieldsObj.description && fieldsObj.description.length > 25) {
            //     v.errors['description'] = {
            //         message: 'Description cannot be longer than 25 characters',
            //     };
            // }
            const matched = await v.check();
            if (!matched) {
                global.errorMessage = v.errors;
                console.log(v.errors);
            }
            return matched;
        }
        this.emailIncludesWebsite = async (email, website) => {
            const domain = website.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
            const regex = new RegExp(`@${domain}$`, 'i');
            return regex.test(email);
        }
        true;    
    }

module.exports = new obj();

