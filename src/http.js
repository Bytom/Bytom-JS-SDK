import axios from 'axios';
import {handleApiError} from "./utils/http";

const basePath = 'api/v1/btm/';

export function serverHttp(host) {
    this.host = host;
    this.request = function(path, body, net, method) {
        var config = {
            url: this.host[net] ? `${this.host[net]}${basePath}${path}`: `${this.host}${basePath}${path}`,
            method: method ? method : 'POST' ,
            headers: {
                Accept: 'application/json',
            },
            data: body,
            timeout: 25000
        };

        //return Promise
        return axios.request(config);
    };
}

export function http(baseUrl) {
    this.baseUrl = baseUrl;
    this.request = function(path, body, method) {
        var config = {
            url: `${this.baseUrl}${basePath}${path}`,
            method:  method ? method : 'POST' ,
            headers: {
                Accept: 'application/json',
            },
            data: body,
            timeout: 25000
        };

        //return Promise
        return axios.request(config)
            .then(function(resp){
                if (resp.status !== 200 || resp.data.code !== 200) {
                    throw handleApiError(resp);
                } else if (resp.data.code === 200) {
                    return resp.data.result.data;
                }
                return resp.data;
            }).catch(error=>{
                throw error;
            });
    };
}