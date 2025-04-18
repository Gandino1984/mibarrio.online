import package_model from "../../models/package_model.js";
import product_model from "../../models/product_model.js";
import shop_model from "../../models/shop_model.js";
import { Op } from "sequelize";

async function getAll() {
    try {
        const packages = await package_model.findAll();

        if (!packages || packages.length === 0) {
            return { error: "No hay paquetes registrados", data: [] };
        }
        
        return { 
            data: packages,
            success: "Paquetes encontrados"
        };
    } catch (err) {
        console.error("-> package_controller.js - getAll() - Error =", err);
        return { error: "Error al obtener todos los paquetes" };
    }
}

async function create(packageData) {
    try {
        const { 
            id_shop, 
            id_product1, 
            id_product2, 
            id_product3, 
            id_product4, 
            id_product5, 
            name_package
        } = packageData;

        // Validate required field
        if (!id_product1) {
            return { error: "Se requiere al menos un producto para crear un paquete" };
        }

        // Check if shop exists
        const shopExists = await shop_model.findByPk(id_shop);
        if (!shopExists) {
            return { error: "El comercio especificado no existe" };
        }

        // Verify that products exist and belong to the shop
        const productIds = [id_product1, id_product2, id_product3, id_product4, id_product5].filter(id => id);
        
        if (productIds.length > 0) {
            const productsCount = await product_model.count({
                where: {
                    id_product: { [Op.in]: productIds },
                    id_shop: id_shop
                }
            });

            if (productsCount !== productIds.length) {
                return { error: "Algunos productos no existen o no pertenecen a este comercio" };
            }
        }

        // Create the package
        const package_created = await package_model.create({
            id_shop,
            id_product1,
            id_product2: id_product2 || null,
            id_product3: id_product3 || null,
            id_product4: id_product4 || null,
            id_product5: id_product5 || null,
            name_package: name_package || null,
            active_package: true,
            // creation_package will be set automatically by the model default
        });
        
        return { 
            data: package_created,
            success: "¡Paquete creado con éxito!"
        };
    } catch (err) {
        console.error("-> package_controller.js - create() - Error = ", err);
        return { error: "Error al crear el paquete" };
    }
}

async function update(id_package, packageData) {
    try {
        // Find the package
        const packageToUpdate = await package_model.findByPk(id_package);
        if (!packageToUpdate) {
            return { error: "Paquete no encontrado" };
        }

        // If id_product1 is being updated, ensure it's not null
        if (packageData.hasOwnProperty('id_product1') && !packageData.id_product1) {
            return { error: "Se requiere al menos un producto para el paquete" };
        }

        // Verify that products exist and belong to the shop
        const productIds = [
            packageData.id_product1 || packageToUpdate.id_product1,
            packageData.id_product2 !== undefined ? packageData.id_product2 : packageToUpdate.id_product2,
            packageData.id_product3 !== undefined ? packageData.id_product3 : packageToUpdate.id_product3,
            packageData.id_product4 !== undefined ? packageData.id_product4 : packageToUpdate.id_product4,
            packageData.id_product5 !== undefined ? packageData.id_product5 : packageToUpdate.id_product5
        ].filter(id => id);

        if (productIds.length > 0) {
            const productsCount = await product_model.count({
                where: {
                    id_product: { [Op.in]: productIds },
                    id_shop: packageToUpdate.id_shop
                }
            });

            if (productsCount !== productIds.length) {
                return { error: "Algunos productos no existen o no pertenecen a este comercio" };
            }
        }

        // Create an update object with only the provided fields
        const updateData = {};
        if (packageData.hasOwnProperty('id_product1')) updateData.id_product1 = packageData.id_product1;
        if (packageData.hasOwnProperty('id_product2')) updateData.id_product2 = packageData.id_product2;
        if (packageData.hasOwnProperty('id_product3')) updateData.id_product3 = packageData.id_product3;
        if (packageData.hasOwnProperty('id_product4')) updateData.id_product4 = packageData.id_product4;
        if (packageData.hasOwnProperty('id_product5')) updateData.id_product5 = packageData.id_product5;
        if (packageData.hasOwnProperty('name_package')) updateData.name_package = packageData.name_package;
        if (packageData.hasOwnProperty('active_package')) updateData.active_package = packageData.active_package;

        // Update the package
        await packageToUpdate.update(updateData);
        
        // Get the updated package
        const updatedPackage = await package_model.findByPk(id_package);
        
        return {
            data: updatedPackage,
            success: "Paquete actualizado con éxito"
        };
    } catch (err) {
        console.error("-> package_controller.js - update() - Error =", err);
        return { error: "Error al actualizar el paquete" };
    }
}

async function getById(id_package) {
    try {
        const package_found = await package_model.findByPk(id_package);
        
        if (!package_found) {
            return { error: "Paquete no encontrado" };
        }
        
        // Get the products in the package
        const packageData = package_found.toJSON();
        
        // Load product details
        const productIds = [
            packageData.id_product1,
            packageData.id_product2,
            packageData.id_product3,
            packageData.id_product4,
            packageData.id_product5
        ].filter(id => id);
        
        if (productIds.length > 0) {
            const products = await product_model.findAll({
                where: { id_product: { [Op.in]: productIds } }
            });
            
            const productsMap = {};
            products.forEach(product => {
                productsMap[product.id_product] = product;
            });
            
            // Add product details to the response
            if (packageData.id_product1) packageData.product1 = productsMap[packageData.id_product1];
            if (packageData.id_product2) packageData.product2 = productsMap[packageData.id_product2];
            if (packageData.id_product3) packageData.product3 = productsMap[packageData.id_product3];
            if (packageData.id_product4) packageData.product4 = productsMap[packageData.id_product4];
            if (packageData.id_product5) packageData.product5 = productsMap[packageData.id_product5];
        }
        
        return {
            data: packageData,
            success: "Paquete encontrado"
        };
    } catch (err) {
        console.error("-> package_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener el paquete" };
    }
}

async function getByShopId(id_shop, activeStatus = null) {
    try {
        // Create the where clause with id_shop
        const whereClause = { id_shop };
        
        // Add active_package filter if specified
        if (activeStatus !== null) {
            whereClause.active_package = activeStatus;
        }
        
        const packages = await package_model.findAll({
            where: whereClause
        });

        if (!packages || packages.length === 0) {
            return { 
                data: [], 
                success: activeStatus === true 
                    ? "No hay paquetes activos en el comercio" 
                    : activeStatus === false
                        ? "No hay paquetes inactivos en el comercio"
                        : "No hay paquetes en el comercio"
            };
        }

        // For each package, get the product details
        const packagesWithProducts = await Promise.all(packages.map(async (pkg) => {
            const pkgData = pkg.toJSON();
            
            // Get product details for non-null product IDs
            const productIds = [
                pkg.id_product1, 
                pkg.id_product2, 
                pkg.id_product3, 
                pkg.id_product4, 
                pkg.id_product5
            ].filter(id => id !== null);
            
            if (productIds.length > 0) {
                const products = await product_model.findAll({
                    where: { id_product: { [Op.in]: productIds } }
                });
                
                // Map products to their respective positions
                const productsMap = {};
                products.forEach(product => {
                    productsMap[product.id_product] = product;
                });
                
                // Add product data to package
                if (pkg.id_product1 && productsMap[pkg.id_product1]) pkgData.product1 = productsMap[pkg.id_product1];
                if (pkg.id_product2 && productsMap[pkg.id_product2]) pkgData.product2 = productsMap[pkg.id_product2];
                if (pkg.id_product3 && productsMap[pkg.id_product3]) pkgData.product3 = productsMap[pkg.id_product3];
                if (pkg.id_product4 && productsMap[pkg.id_product4]) pkgData.product4 = productsMap[pkg.id_product4];
                if (pkg.id_product5 && productsMap[pkg.id_product5]) pkgData.product5 = productsMap[pkg.id_product5];
            }
            
            return pkgData;
        }));

        return { 
            data: packagesWithProducts,
            success: activeStatus === true 
                ? "Paquetes activos encontrados" 
                : activeStatus === false
                    ? "Paquetes inactivos encontrados"
                    : "Paquetes encontrados"
        };
    } catch (err) {
        console.error("-> package_controller.js - getByShopId() - Error = ", err);
        return { error: "Error al obtener los paquetes del comercio" };
    }
}

async function getActiveByShopId(id_shop) {
    return getByShopId(id_shop, true);
}

async function getInactiveByShopId(id_shop) {
    return getByShopId(id_shop, false);
}

async function toggleActiveStatus(id_package) {
    try {
        const package_found = await package_model.findByPk(id_package);
        
        if (!package_found) {
            return { error: "Paquete no encontrado" };
        }
        
        // Toggle the active status
        package_found.active_package = !package_found.active_package;
        await package_found.save();
        
        return { 
            data: package_found,
            success: package_found.active_package 
                ? "Paquete activado ." 
                : "Paquete desactivado ." 
        };
    } catch (err) {
        console.error("-> package_controller.js - toggleActiveStatus() - Error = ", err);
        return { error: "Error al cambiar el estado del paquete" };
    }
}

async function removeById(id_package) {
    try {
        const package_found = await package_model.findByPk(id_package);

        if (!package_found) {
            return { error: "Paquete no encontrado" };
        }

        // Delete the package
        await package_found.destroy();

        return {
            data: id_package,
            success: "Paquete eliminado .",
        };
    } catch (err) {
        console.error("-> package_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar el paquete" };
    }
}

async function removeByShopId(id_shop, transaction) {
    try {
        // Find all packages for this shop first to get the count
        const packages = await package_model.findAll({
            where: { id_shop }
        });

        if (packages.length === 0) {
            return { count: 0 };
        }

        // Remove all packages for this shop
        await package_model.destroy({
            where: { id_shop },
            transaction
        });

        return { 
            count: packages.length,
            success: `Se eliminaron ${packages.length} paquetes del comercio`
        };
    } catch (err) {
        console.error("-> package_controller.js - removeByShopId() - Error = ", err);
        return { error: "Error al eliminar los paquetes del comercio" };
    }
}

export { 
    getAll, 
    getById, 
    create, 
    update, 
    removeById,
    removeByShopId,
    getByShopId,
    getActiveByShopId,
    getInactiveByShopId,
    toggleActiveStatus
}

export default { 
    getAll, 
    getById, 
    create, 
    update, 
    removeById,
    removeByShopId,
    getByShopId,
    getActiveByShopId,
    getInactiveByShopId,
    toggleActiveStatus
}