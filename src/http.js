import axios from 'axios';
import {handleApiError, handleAxiosError} from './utils/http';
import { camelize } from "./utils/utils";

// const basePath = 'api/v1/btm';

export function serverHttp(host) {
    this.host = host;
    this.request = function(path, body, net, method) {
        var config = {
            url: this.host[net] ? `${this.host[net]}${path}`: `${this.host}${path}`,
            method: method ? method : 'POST' ,
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
                    return camelize(resp.data.data);
                }
                return resp.data;
            }).catch(error=>{
                throw handleAxiosError(error);
            });
    };
}

export function http(baseUrl) {
    this.baseUrl = baseUrl;
    this.request = function(path, body, method) {
        var config = {
            url: `${this.baseUrl}${path}`,
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
                    return camelize(resp.data.data);
                }
                return resp.data;
            }).catch(error=>{
                throw error;
            });
    };
}