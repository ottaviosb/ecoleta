import { Request, Response } from 'express';
import knex from '../database/connection';

class PointController {
    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()));

        const points = await knex('points')
        .join('point_items', 'points.id', '=', 'point_items.point_id')
        .whereIn('point_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.0.6:3333/uploads/${point.image}`,
            };
        })

        return response.json(points);
    }

    async show(request: Request, response: Response) {
        //const id = request.params.id
        const {id} = request.params; //Desestruturação

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({message: 'Point not found'});
        }

        const serializedPoint = {   
                ...point,
                image_url: `http://192.168.0.6:3333/uploads/${point.image}`, 
        };


        const items = await knex('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id)
        .select('items.title');

        return response.json({point: serializedPoint, items});
    }

    async create(request: Request, response: Response) {
        //desestruturação do body
        const {
            name,
            email,
            whatsapp,
            city,
            uf,
            latitude,
            longitude,
            items
        } = request.body;
    
        const trx = await knex.transaction(); //Transaction para evitar que se faça uma query se a outra tiver um erro
    
        const point =   {
            image: request.file.filename,
            name, //short syntax
            email,
            whatsapp,
            city,
            uf,
            latitude,
            longitude
        }  

        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0];
    
        const pointItems = items
        .split(',')
        .map((item:string) => Number(item.trim()))
        .map((item_id: number) => {
            return {
                item_id,
                point_id
            }
        })
    
        await trx('point_items').insert(pointItems);

        await trx.commit(); //Quando se utiliza uma transaction é preciso dar um commit.
    
        return response.json({
            id: point_id,
            ...point //spread operator, adiciona o objeto point dentro do objeto retornado
        });
    }

}

export default PointController;