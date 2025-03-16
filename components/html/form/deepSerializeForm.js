export default function deepSerializeForm(form) {

    var obj = {};

    var formData = new FormData(form);

    var coerce_types = { 'true': !0, 'false': !1, 'null': null };

    /**
     * Get the input value from the formData by key
     * @return {mixed}
     */
    var getValue = function (formData, key) {

        var val = formData.get(key);

        val = val && !isNaN(val) ? +val              // number
            : val === 'undefined' ? undefined         // undefined
                : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                    : val;                                                // string

        return val;
    }

    for (var key of formData.keys()) {

        var val = getValue(formData, key);
        var cur = obj;
        var i = 0;
        var keys = key.split('][');
        var keys_last = keys.length - 1;


        if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {

            keys[keys_last] = keys[keys_last].replace(/\]$/, '');

            keys = keys.shift().split('[').concat(keys);

            keys_last = keys.length - 1;

        } else {

            keys_last = 0;
        }


        if (keys_last) {

            for (; i <= keys_last; i++) {
                key = keys[i] === '' ? cur.length : keys[i];
                cur = cur[key] = i < keys_last
                    ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : [])
                    : val;
            }

        } else {

            if (Array.isArray(obj[key])) {

                obj[key].push(val);

            } else if (obj[key] !== undefined) {

                obj[key] = [obj[key], val];

            } else {

                obj[key] = val;

            }

        }

    }

    return obj;

}