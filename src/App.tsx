import { ChangeEvent, FormEvent, useState } from "react";
import { v4 as uuid } from "uuid";
import CircleColor from "./components/CircleColor";
import ErrorMessage from "./components/ErrorMessage";
import ProductCard from "./components/ProductCard";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Modal from "./components/ui/Modal";
import { categories, colors, formInputsList, productList } from "./data";
import { IProduct } from "./interfaces";
import { productValidation } from "./validation";
import Select from "./components/ui/Select";
import { ProductNameTypes } from "./types";

const App = () => {
  const defaultProductObj = {
    title: "",
    description: "",
    imageURL: "",
    price: "",
    colors: [],
    category: {
      name: "",
      imageURL: "",
    },
  };
  /* ------- STATE -------  */
  const [products, setProducts] = useState<IProduct[]>(productList);
  const [product, setProduct] = useState<IProduct>(defaultProductObj);
  const [productToEdit, setProductToEdit] = useState<IProduct>(defaultProductObj);
  const [productToEditIdx, setProductToEditIdx] = useState<number>(0);
  const [errors, setErrors] = useState({ title: "", description: "", imageURL: "", price: "" });
  const [tempColors, setTempColor] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  /* ------- HANDLER -------  */
  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);
  const closeEditModal = () => setIsOpenEditModal(false);
  const openEditModal = () => setIsOpenEditModal(true);

  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setProduct({
      ...product,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const onChangeEditHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setProductToEdit({
      ...productToEdit,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const onCancel = () => {
    setProduct(defaultProductObj);
    closeModal();
  };

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const { title, description, price, imageURL } = product;

    const errors = productValidation({
      title,
      description,
      price,
      imageURL,
    });

    const hasErrorMsg =
      Object.values(errors).some(value => value === "") && Object.values(errors).every(value => value === "");

    if (!hasErrorMsg) {
      setErrors(errors);
      return;
    }

    setProducts(prev => [{ ...product, id: uuid(), colors: tempColors, category: selectedCategory }, ...prev]);
    setProduct(defaultProductObj);
    setTempColor([]);
    closeModal();
  };

  const submitEditHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const { title, description, price, imageURL } = productToEdit;

    const errors = productValidation({
      title,
      description,
      price,
      imageURL,
    });

    const hasErrorMsg =
      Object.values(errors).some(value => value === "") && Object.values(errors).every(value => value === "");

    if (!hasErrorMsg) {
      setErrors(errors);
      return;
    }

    const updatedProducts = [...products];
    updatedProducts[productToEditIdx] = { ...productToEdit, colors: tempColors.concat(productToEdit.colors) };
    setProducts(updatedProducts);

    setProductToEdit(defaultProductObj);
    setTempColor([]);
    closeEditModal();
  };

  /* ------- RENDER -------  */
  const renderProductList = products.map((product, idx) => (
    <ProductCard
      key={product.id}
      product={product}
      setProductToEdit={setProductToEdit}
      openEditModal={openEditModal}
      idx={idx}
      setProductToEditIdx={setProductToEditIdx}
    />
  ));
  const renderFormInputList = formInputsList.map(input => (
    <div className="flex flex-col" key={input.id}>
      <label htmlFor={input.id} className="mb-[2px] text-sm font-medium text-gray-700">
        {input.label}
      </label>
      <Input type="text" id={input.id} name={input.name} value={product[input.name]} onChange={onChangeHandler} />
      <ErrorMessage msg={errors[input.name]} />
    </div>
  ));
  const renderProductColors = colors.map(color => (
    <CircleColor
      key={color}
      color={color}
      onClick={() => {
        if (tempColors.includes(color)) {
          setTempColor(prev => prev.filter(item => item !== color));
          return;
        }
        if (productToEdit.colors.includes(color)) {
          setTempColor(prev => prev.filter(item => item !== color));
          return;
        }
        setTempColor(prev => [...prev, color]);
      }}
    />
  ));
  const renderProductEditWithErrorMsg = (id: string, label: string, name: ProductNameTypes) => {
    return (
      <div className="flex flex-col">
        <label htmlFor={id} className="mb-[2px] text-sm font-medium text-gray-700">
          {label}
        </label>
        <Input type="text" id={id} name={name} value={productToEdit[name]} onChange={onChangeEditHandler} />
        <ErrorMessage msg={errors[name]} />
      </div>
    );
  };

  return (
    <main className="container">
      <Button
        className="block bg-indigo-700 hover:bg-indigo-800 mx-auto my-10 px-10 font-medium"
        onClick={openModal}
        width="w-fit"
      >
        Build Product
      </Button>

      <div className="m-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 p-2 rounded-md">
        {renderProductList}
      </div>

      {/* ADD PRODUCT MODAL */}
      <Modal isOpen={isOpen} closeModal={closeModal} title="ADD A NEW PRODUCT">
        <form className="space-y-3" onSubmit={submitHandler}>
          {renderFormInputList}
          <Select selected={selectedCategory} setSelected={setSelectedCategory} />
          <div className="flex items-center flex-wrap space-x-1">{renderProductColors}</div>
          <div className="flex items-center flex-wrap space-x-1">
            {tempColors.map(color => (
              <span
                key={color}
                className="p-1 mr-1 mb-1 text-xs rounded-md text-white"
                style={{ backgroundColor: color }}
              >
                {color}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <Button className="bg-indigo-700 hover:bg-indigo-800">Submit</Button>
            <Button className="bg-gray-400 hover:bg-gray-500" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PRODUCT MODAL */}
      <Modal isOpen={isOpenEditModal} closeModal={closeEditModal} title="EDIT THIS PRODUCT">
        <form className="space-y-3" onSubmit={submitEditHandler}>
          {renderProductEditWithErrorMsg("title", "Product Title", "title")}
          {renderProductEditWithErrorMsg("description", "Product Description", "description")}
          {renderProductEditWithErrorMsg("imageURL", "Product Image URL", "imageURL")}
          {renderProductEditWithErrorMsg("price", "Product Price", "price")}

          {/* <Select selected={selectedCategory} setSelected={setSelectedCategory} /> */}

          <div className="flex items-center flex-wrap space-x-1">{renderProductColors}</div>
          <div className="flex items-center flex-wrap space-x-1">
            {tempColors.concat(productToEdit.colors).map(color => (
              <span
                key={color}
                className="p-1 mr-1 mb-1 text-xs rounded-md text-white"
                style={{ backgroundColor: color }}
              >
                {color}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <Button className="bg-indigo-700 hover:bg-indigo-800">Submit</Button>
            <Button className="bg-gray-400 hover:bg-gray-500" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
};

export default App;
