import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    // const [cart, setCart] = useState([])
    const cart = useLoaderData();
    const [itemPerPage, setItemPerPage] = useState(5)
    const [currentPage, setCurrentPage] = useState(1)
    // const { count } = useLoaderData()
    // const count = 76;
    const [count,setCount] = useState(0)


    const storedCart = getShoppingCart();

    // console.log(count)

    /**steps
    * 1.GET the total number of products from the server
    *2. number of items per page
    *3. calculate the number of pages
    *4. load data for the current page
    *5. display the page number
    *6. load data based on the page number
     */
    const numberOfPages = Math.ceil(count / itemPerPage)
    // console.log(numberOfPages)

    // const pages = [];
    // for (let i = 1; i <= numberOfPages; i++) {
    //     pages.push(i)
    // }

    const pages = [...Array(numberOfPages).keys()];

useEffect(() => {
    fetch('http://localhost:5000/productsCount')
        .then(res => res.json())
        .then(data => setCount(data.count))
}, [])

    useEffect(() => {
        fetch(`http://localhost:5000/products?page=${currentPage}&size=${itemPerPage}`)
            .then(res => res.json())
            .then(data => setProducts(data))
    }, [currentPage, itemPerPage]);

    useEffect(() => {
        const savedCart = [];
        // step 1: get id of the addedProduct
        for (const id in storedCart) {
            // step 2: get product from products state by using id
            const addedProduct = products.find(product => product._id === id)
            if (addedProduct) {
                // step 3: add quantity
                const quantity = storedCart[id];
                addedProduct.quantity = quantity;
                // step 4: add the added product to the saved cart
                savedCart.push(addedProduct);
            }
            // console.log('added Product', addedProduct)
        }
        // step 5: set the cart
        // setCart(savedCart);
    }, [products])

    const handleAddToCart = (product) => {
        // cart.push(product); '
        let newCart = [];
        // const newCart = [...cart, product];
        // if product doesn't exist in the cart, then set quantity = 1
        // if exist update quantity by 1
        const exists = cart.find(pd => pd._id === product._id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        }
        else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id !== product._id);
            newCart = [...remaining, exists];
        }

        // setCart(newCart);
        addToDb(product._id)
    }

    const handleClearCart = () => {
        // setCart([]);
        deleteShoppingCart();
    }
    const handleitemPerPage = (e) => {
        const val = parseInt(e.target.value)
        console.log(val)
        setItemPerPage(val)
        //jotobar switch korbo totobar page 1 e jabe
        setCurrentPage(1)
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < numberOfPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    return (
        <div className='shop-container'>
            <div className="products-container">
                {
                    products.map(product => <Product
                        key={product._id}
                        product={product}
                        handleAddToCart={handleAddToCart}
                    ></Product>)
                }
            </div>
            <div className="cart-container">
                <Cart
                    cart={cart}
                    handleClearCart={handleClearCart}
                >
                    <Link className='proceed-link' to="/orders">
                        <button className='btn-proceed'>Review Order</button>
                    </Link>
                </Cart>
            </div>

            <div className='pagination'>
                <button onClick={handlePreviousPage}>Prev</button>

                {
                    pages.map(page => {
                        return <span key={page} >
                            <button key={page} className={currentPage === page + 1 ? 'btn-page' : ''}
                                onClick={() => setCurrentPage(page + 1)}
                            >{page + 1}</button>
                        </span>

                    })
                }

                <button onClick={handleNextPage}>Next</button>

                <select value={itemPerPage} onChange={handleitemPerPage}>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                </select>

            </div>
        </div>
    );
};

export default Shop;