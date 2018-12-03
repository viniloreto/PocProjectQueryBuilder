const express = require('express')
const routes = express.Router()
const connection = require('../database/database.js')
var product = require('../model/Products')

const httpStatus = {
    statusOK: " Produto cadastrado com sucesso",
    statusNotOK: "Falha ao inserir o produto",
    invalidRequest: "Falha ao buscar os produtos",
    invalidCode: "Código do produto inválido",
    deletedOK: "Produto deletado com sucesso",
    deletedNotOK: "Falha ao deletar o produto",
    statusUpOk: "Produto atualizado com sucesso",
    statusUpNotOk: "Falha ao atualizar o produto",
    productsNotFound: "Produtos não encontrados",
    productNotFound: "Produto não encontrado",
}

//Conecta ao banco
connection.then((connection) => {

    //Busca a tabela Product
    let productRepo = connection.getRepository("Product");

    routes.get('/products', async (req, res) => {

        try {
            var { offset, limit, orderColumn, orderType } = req.query

            if (orderColumn) {
                orderColumn = orderColumn.toLowerCase()
            } else {
                orderColumn = 'product_name'
            }
            if (orderType) {
                orderType = orderType.toUpperCase()
            } else {
                orderType = 'ASC'
            }
            const produtcs = await productRepo
                .createQueryBuilder("product")
                .addSelect(orderColumn, "col")
                .offset(offset)
                .limit(limit)
                .orderBy(
                    {
                        col: orderType
                    }
                )
                .getMany();

            if (produtcs.length > 0) {
                res.status(200).send(produtcs)
            } else {
                res.status(404).send(httpStatus.productsNotFound)
            }

        } catch (error) {
            res.status(400).send(httpStatus.invalidCode)
        }

    });

    routes.post('/products', async (req, res) => {

        try {
           var productHelper = new product()
           productHelper = req.body
            await connection.createQueryBuilder()
                .insert()
                .into("Product")
                .values(productHelper)
                .execute();
            res.status(200).send(httpStatus.statusOK)

        } catch (error) {
            res.status(400).send(httpStatus.statusNotOK)
        }
    })

    routes.get('/products/:code', async (req, res) => {

        try {
            const resultProduct = await productRepo.createQueryBuilder()
                .select("product")
                .from("Product", "product")
                .where("product.product_code = :code", { code: req.params.code })
                .getOne();
            if (resultProduct) {
                res.status(200).send(resultProduct)
            } else {
                res.status(404).send(httpStatus.productNotFound)
            }

        } catch (error) {
            res.status(400).send(httpStatus.invalidCode)
        }
    })

    routes.patch('/products/:code', async (req, res) => {

        productPatch = new product ()
        productPatch = req.body
        try {
            await connection
                .createQueryBuilder()
                .update("Product")
                .set(productPatch)
                .where("product_code = :code", { code: req.params.code })
                .execute();
            res.status(200).send(httpStatus.statusUpOk)
        } catch (error) {
            res.status(400).send(httpStatus.statusUpNotOk)
        }
    })

    routes.delete('/products/:code', async (req, res) => {

        try {
            const resultDelete = await connection
                .createQueryBuilder()
                .delete()
                .from("Product")
                .where("product_code = :code", { code: req.params.code })
                .execute();

            if (resultDelete.raw[1] === 0) {
                res.status(404).send(httpStatus.productNotFound)
            } else {
                res.status(200).send(httpStatus.deletedOK)
            }

        } catch (error) {
            res.status(200).send(httpStatus.deletedNotOK)
        }

    })
}).catch((err) => {
    alert('Erro ao conectar! ERRO: ', err.message)
})

module.exports = routes

