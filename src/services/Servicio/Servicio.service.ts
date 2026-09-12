import { api } from '../../Api/api';
import {type Servicio } from '../../types/Servicios/Servicios';

export const ServicioService = {
    getall: async(): Promise<Servicio[]> => {
        const response =await api.get("/Service/list/");
        
        return response.data;
    },
    getbyid: async(id:number): Promise<Servicio> => {
        const response = await api.get(`/Service/${id}`);
        return response.data;
    },

    deletebyid: async(id : number) =>{
        try{
            const response = await api.delete(`/Service/${id}`);
            return response.data.message;
        }
        catch( err : any ){

            return err.data.response;
        }


    }
}
