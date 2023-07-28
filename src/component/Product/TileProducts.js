import React, { Fragment, useEffect, useState } from "react";
import "./Products.css";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearErrors, getProduct } from "../../actions/productAction";
import Loader from "../layout/Loader/Loader";
import ProductCard from "../Home/ProductCard";
import Pagination from "react-js-pagination";
import Slider from "@material-ui/core/Slider";
import { useAlert } from "react-alert";
import Typography from "@material-ui/core/Typography";
import MetaData from "../layout/MetaData";
import { getAllBrand } from '../../actions/brandAction';
import { getAllCategory } from '../../actions/categoryAction';
import { getAllSubCategory} from "../../actions/subCategoryAction";
import Footer from "../layout/Footer/Footer";

const TileProducts = ({ match }) => {
  const dispatch = useDispatch();

  const { allBrand } = useSelector((state) => state.allBrand);
  const { allCategory } = useSelector((state) => state.allCategory);
  const { allSubCategory } = useSelector((state) => state.allSubCategory);

  const alert = useAlert();

  const [brand, setBrand] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [price, setPrice] = useState([0, 90000]);
  const [category, setCategory] = useState("Tiles");
  const [subcategory, setSubCategory] = useState("");
  const [checked, setChecked] = useState([]);
  const [ratings, setRatings] = useState(0);

  const {
    products,
    loading,
    error,
    productsCount,
    resultPerPage,
    filteredProductsCount,
  } = useSelector((state) => state.products);

  const keyword = match.params.keyword;

  const setCurrentPageNo = (e) => {
    setCurrentPage(e);
  };

  const priceHandler = (event, newPrice) => {
    setPrice(newPrice);
  };
  let count = filteredProductsCount;

  useEffect(async () => {
    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }
    await dispatch(getAllBrand());
    await dispatch(getAllCategory());
    dispatch(getProduct(keyword, currentPage, price, category, subcategory, brand, ratings));
  }, [getAllBrand,getAllCategory, keyword, currentPage, price, category, brand, ratings, subcategory, alert, error]);

  const subCategoryCall = async (id) =>{
    await dispatch(getAllSubCategory(id));
  }

  const onRatingChange = (e) => {
    console.log("new rating",e.target.value)
    setRatings(e.target.value);
  }

  const handleCheck = async (event) => {
    var updatedList = [...checked];
    if (event.target.checked) {
      if(updatedList.includes(event.target.value)){
        alert.error("ALready included");
      }
      else{
        updatedList = [...checked, event.target.value];
      }
    } else {
      updatedList.splice(checked.indexOf(event.target.value), 1);
    }
    setChecked(updatedList);
    await dispatch(getProduct(keyword, currentPage, price, category, subcategory, updatedList, ratings));
    console.log("checked list",checked);
  };

  const checkedItems = checked.length
    ? checked.reduce((total, item) => {
        return total + ", " + item;
      })
    : "";


  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title="PRODUCTS -- Logger India" />
          <h2 className="productsHeading">Products</h2>
<div className="main-div-filter-product">
          <div className="products">
            {products &&
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
          </div>

          <div className="filterBox">
          {
           (price[0] != 0 || price[1] != 90000) &&  <div className="btn btn-large clear-details" onClick={() => {dispatch(getProduct(keyword, currentPage, [0,90000], category, subcategory, [], ratings)); setPrice([0,90000]);}}>CLEAR</div>
         }
            <Typography>PRICE</Typography>
            <Slider
              value={price}
              onChange={priceHandler}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
              min={0}
              max={90000}
            />
            <div className="price-div-filter">
            <div className="price-min-value">Min ₹<input className="input-price-field" value={price[0]} required onChange={(e) => setPrice([e.target.value,price[1]])} /></div>
            <div className="price-mid-value" >to</div>
            <div className="price-max-value">₹<input className="input-price-field-2" value={price[1]} required onChange={(e) => setPrice([price[0],e.target.value])} /></div>
            </div>

            <Typography>CATEGORIES</Typography>
            <ul className="categoryBox">
            <Link to='/products' className="all-Products-filter"
             onClick={() => {dispatch(getProduct(keyword, currentPage, price, "", "", "", 0)); setChecked([])}}
            >All Products</Link>
            {allCategory.map((cat) =>(
              <div>
              <i class="fa fa-solid fa-angle-down sub-cat-icon" onClick={() => subCategoryCall(cat._id)}></i>{" "}
              <div className="headers-category"
            onClick={() => {setCategory(cat.name); setSubCategory("");}}
            >{cat.name} 
              </div> 
              {(allSubCategory.length >0 && cat._id == allSubCategory[0].category) && allSubCategory.map((category) => (
                <li
                  className="category-link"
                  onClick={() => setSubCategory(category.name)}
                >
                  {category.name}
                </li>
              ))}
              </div>
             
            ))}
            </ul>

            <div className="brand-filter-div">
            {
              checkedItems.length>0 && <div className="btn btn-large clear-details" onClick={() => {dispatch(getProduct(keyword, currentPage, price, category, subcategory, [], ratings)); setChecked([]);}}>CLEAR</div>
            }
              <Typography component="legend">BRAND</Typography>
              
              <div className="showing-div">
              Selected brands are: <div className="brand-uderline">{`${checkedItems}`}<hr className="brand-hr"/> </div>
      </div>
              <div className="list-container">
          {allBrand.map((item) => (
            <div>
              <input value={item.name} type="checkbox" onChange={handleCheck} defaultChecked={ checkedItems.includes(item.name) ? true : false} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
              </div>

              <div>
              <Typography component="legend">CUSTOMER RATINGS</Typography>
              <select value={ratings} className="rating-search"
                onChange={onRatingChange}>
              <option value="0">Select Rating</option>
              <option value="4">4★ & above</option>
              <option value="3">3★ & above</option>
              <option value="2">2★ & above</option>
              <option value="1">1★ & above</option>
              </select>
              </div>
          </div>
          </div>
          {resultPerPage < count && (
            <div className="paginationBox">
              <Pagination
                activePage={currentPage}
                itemsCountPerPage={resultPerPage}
                totalItemsCount={productsCount}
                onChange={setCurrentPageNo}
                nextPageText="Next"
                prevPageText="Prev"
                firstPageText="1st"
                lastPageText="Last"
                itemClass="page-item"
                linkClass="page-link"
                activeClass="pageItemActive"
                activeLinkClass="pageLinkActive"
              />
            </div>
          )}
          <Footer />
        </Fragment>
      )}
    </Fragment>
  );
};

export default TileProducts;
