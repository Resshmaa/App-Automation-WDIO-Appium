const fetch = require('node-fetch');
const qs = require('querystring');
const Log = require('./Log');

class ApiRequest {
    static responseStatus
    static responseBodyJson
    static responseText


    /**
     * Generic function to send POST request
     * @param {*} url - Request URL
     * @param {*} data - Request Body
     * @param {*} headers - Request Headers
     */
    static async fetch_post_request(url, headers, data) {
        Log.info("Post request on: '" + url + "' endpoint")

        if (headers['Content-Type'] && headers['Content-Type'].includes("application/x-www-form-urlencoded")) {
            data = qs.stringify(data);  // converts object to urlencoded string
        } else {
            data = JSON.stringify(data);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: data  // <-- pass string directly, no JSON.stringify here!
        });

        return await this.handleResponse(response);
    }


    /**
     * Generic function to send GET request
     * @param {*} url - Request URL
     * @param {*} data - Request Body. Can be NULL or String
     * @param {*} headers - Request Headers
     */
        static async fetch_get_request(url, headers) {
            Log.info("Get request on: '" + url + "' endpoint")

            const response = await fetch (url, {
                method: 'GET',
                headers: headers
            })
        return await this.handleResponse(response);
    }


    /**
     * Generic function to send PUT request
     * @param {*} url - Request URL
     * @param {*} data - Request Body
     * @param {*} headers - Request Headers
     */
        static async fetch_put_request(url, headers, data) {
            Log.info("Put request on: '" + url + "' endpoint")

            const response = await fetch (url, { 
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(data)
            })
        return await this.handleResponse(response);
    }


    /**
     * Generic function to send DELETE request
     * @param {*} url - Request URL
     * @param {*} data - Request Body. Can be NULL or String
     * @param {*} headers - Request Headers
     */
        static async fetch_delete_request(url, headers, data) {
            Log.info("Delete request on: '" + url + "' endpoint")

            const response = await fetch (url, {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify(data)
            })
        return await this.handleResponse(response);
    }


    static async handleResponse(response) {
        this.responseStatus = response.status;
        this.responseText = await response.text();
        try {
            this.responseBodyJson = JSON.parse(this.responseText);
        }
        catch (e) {
            this.responseBodyJson = {};
        }
        return {
            status: this.responseStatus,
            json: this.responseBodyJson,
            text: this.responseText,
            ok: response.ok
        };
    }

    static getResponseStatus() {
        return this.responseStatus;
    }

    static getResponseJson() {
        return this.responseBodyJson;
    }

    static getResponseText() {
        return this.responseText;
    }

}

module.exports = ApiRequest;