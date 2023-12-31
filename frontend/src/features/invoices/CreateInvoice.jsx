import { useEffect, useState } from "react";
import { FaPaperclip, FaPlus } from "react-icons/fa6";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import DatePicker, { registerLocale } from "react-datepicker";
import el from "date-fns/locale/el"; // the locale you want

import "react-datepicker/dist/react-datepicker.css";
import {
  createInvoice,
  resetCreateInvoiceStatus,
  selectCreateInvoiceError,
  selectCreateInvoiceStatus,
} from "./invoicesSlice";
import toast, { Toaster } from "react-hot-toast";
import { selectCurrentUser } from "../authentication/authSlice";
import InputGroup from "../../ui/InputGroup";
import { validateEmail, validateString } from "../../utils/validateFuncs";
import Button from "../../ui/Button";

/**
 * Component is responsible for displaying the create invoice modal and submitting the form's dats to the backend
 *
 * It takes a setInvoiceModalVisibilty prop which is used to close the modal
 */
const CreateInvoice = ({ setInvoiceModalVisibilty }) => {
  const status = useSelector(selectCreateInvoiceStatus);
  const error = useSelector(selectCreateInvoiceError);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  // State to hold form data
  const [formData, setFormData] = useState({
    recipientEmail: "",
    description: "",
    issuedDate: new Date(),
    dueDate: new Date(),
    billFrom: currentUser.fullname,
    billTo: "",
    additionalNotes: "",
  });

  // state to hold form errors
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    setFormErrors({});
    const validRecipentEmail = validateEmail(formData.recipientEmail);
    const validDescription = validateString(formData.description);
    const validBillFrom = validateString(formData.billFrom);
    const validBillTo = validateString(formData.billTo);
    const validInvoiceItems = invoiceItems.some((item) =>
      validateString(item.name)
    );

    if (!validRecipentEmail) {
      setFormErrors((prev) => ({
        ...prev,
        recipientEmail: "Invalid email address",
      }));
    }
    if (!validDescription) {
      setFormErrors((prev) => ({
        ...prev,
        description: "This field is required",
      }));
    }
    if (!validBillFrom) {
      setFormErrors((prev) => ({
        ...prev,
        billFrom: "This field is required",
      }));
    }
    if (!validBillTo) {
      setFormErrors((prev) => ({ ...prev, billTo: "This field is required" }));
    }
    if (!validInvoiceItems) {
      setFormErrors((prev) => ({
        ...prev,
        items: "Atleast one item is required",
      }));
    }

    return (
      validRecipentEmail &&
      validDescription &&
      validBillFrom &&
      validBillTo &&
      validInvoiceItems
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let items = invoiceItems.filter((item) => validateString(item.name)); // So only valid items get passed to the backend.
    dispatch(createInvoice({ data: formData, items }));
  };

  const handleFormInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  //   state to hold invoice itemes
  const [invoiceItems, setInvoiceItems] = useState([
    {
      name: "",
      price: 0,
      qty: 0,
      get total() {
        return this.price * this.qty;
      },
    },
  ]);

  // function to add new invoice item
  const addItem = () => {
    const itemData = {
      name: "",
      price: 0,
      qty: 0,
      get total() {
        return this.price * this.qty;
      },
    };
    setInvoiceItems((prev) => [...prev, itemData]);
  };
  //   function to handle invoice items input change
  const handleInvoiceItemsInputChange = (e, id) => {
    setInvoiceItems((prev) =>
      prev.map((item, index) =>
        index == id
          ? {
              ...item,
              [e.target.name]: e.target.value,
              get total() {
                return this.price * this.qty;
              },
            }
          : item
      )
    );
  };

  // Date stuff
  registerLocale("el", el); // register it with the name you want
  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  useEffect(() => {
    if (status === "success") {
      toast.success("Successfully created Invoice");
      dispatch(resetCreateInvoiceStatus());
    }
    if (status === "error") {
      toast.error(error);
      dispatch(resetCreateInvoiceStatus());
    }
  }, [status]);

  return (
    <div className="fixed overflow-y-auto top-0 left-0 w-screen bg-slate-500  h-screen bg-opacity-50 flex justify-end px-5 lg:px-16 py-2 z-50">
      <Toaster />
      <div className="bg-gray rounded-md shadow-md w-full pb-4 overflow-y-auto lg:w-1/2">
        <div className="flex items-center gap-16  p-6 border-b border-lightGray">
          <button onClick={() => setInvoiceModalVisibilty(false)}>
            <IoCloseCircleOutline size={28} />
          </button>

          <h2 className="self-end font-semibold text-2xl">
            Create New Invoice
          </h2>
        </div>
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center justify-between gap-4 lg:text-xl">
            <span className="font-semibold">Invoice</span>
            <span>#INV-20231120-001</span>
          </div>
          <button className="underline">COPY LINK</button>
        </div>
        <form
          className="px-8 flex flex-col gap-4"
          onSubmit={(e) => handleSubmit(e)}
        >
          <InputGroup
            type="text"
            name="recipientEmail"
            value={formData.recipientEmail}
            onChange={handleFormInputChange}
            error={formErrors.recipientEmail}
            label="Email"
          />
          <InputGroup
            type="text"
            name="description"
            value={formData.description}
            onChange={handleFormInputChange}
            error={formErrors.description}
            label="Product Description"
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className=" flex flex-col gap-2">
              <label htmlFor="issuedOn">Issued On</label>
              <DatePicker
                selected={formData.issuedDate}
                onSelect={(date) => handleDateChange("issuedDate", date)}
                locale="el"
                className="w-full bg-transparent p-3 border border-lightGray rounded-sm focus:outline-blue"
              />
              {formErrors?.issuedOn && (
                <span className="text-red font-semibold text-sm">
                  {formErrors.issuedOn}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="dueOn">Due On</label>
              <DatePicker
                selected={formData.dueDate}
                onSelect={(date) => handleDateChange("dueDate", date)}
                locale="el"
                className="w-full bg-transparent p-3 border border-lightGray rounded-sm focus:outline-blue"
              />
              {formErrors?.dueOn && (
                <span className="text-red font-semibold text-sm">
                  {formErrors.dueOn}
                </span>
              )}
            </div>
            <InputGroup
              type="text"
              name="billFrom"
              value={formData.billFrom}
              onChange={handleFormInputChange}
              error={formErrors.billFrom}
              label="Bill From"
            />
            <InputGroup
              type="text"
              name="billTo"
              value={formData.billTo}
              onChange={handleFormInputChange}
              error={formErrors.billTo}
              label="Bill To"
            />
          </div>
          <div>
            <span className="font-bold my-4">Invoice Items</span>
            <div className="w-full">
              <table className=" text-left w-full border-separate border-spacing-4 ">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th className="hidden lg:block">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item, index) => (
                    <tr key={index}>
                      <td className=" border border-lightGray text-ellipsis rounded-sm overflow-hidden">
                        <input
                          type="text"
                          className="w-full p-2 bg-transparent focus:outline-blue"
                          name="name"
                          value={item.name}
                          onChange={(e) =>
                            handleInvoiceItemsInputChange(e, index)
                          }
                        />
                      </td>
                      <td className=" border border-lightGray text-ellipsis rounded-sm overflow-hidden">
                        <input
                          type="number"
                          step={0.0}
                          className="w-full p-2 bg-transparent focus:outline-blue"
                          name="price"
                          value={item.price}
                          onChange={(e) =>
                            handleInvoiceItemsInputChange(e, index)
                          }
                        />
                      </td>
                      <td className=" border border-lightGray rounded-sm overflow-hidden">
                        <input
                          type="number"
                          className="w-full p-2 bg-transparent focus:outline-blue"
                          name="qty"
                          value={item.qty}
                          onChange={(e) =>
                            handleInvoiceItemsInputChange(e, index)
                          }
                        />
                      </td>
                      <td className="hidden border border-lightGray p-2 rounded-sm overflow-hidden lg:block">
                        {item.total?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-start justify-between">
                <button
                  className="flex items-center gap-2"
                  onClick={addItem}
                  type="button"
                >
                  <FaPlus size={14} />
                  Add Item
                </button>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-8 items-center justify-between">
                    <span>Subtotal</span>
                    <span>
                      {invoiceItems
                        .reduce((acc, curr) => acc + curr.total, 0)
                        ?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-8 items-center justify-between">
                    <span>Tax</span>
                    <span>0.00</span>
                  </div>
                  <div className="flex gap-8 items-center justify-between">
                    <span>Total</span>
                    <span>0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {formErrors?.items && (
            <span className="block mb-4 text-red font-semibold text-sm">
              {formErrors.items}
            </span>
          )}
          <span className="block text-xs">
            Payment due within 30 days. Late payments subject to a 5% fee.
          </span>
          <div className="flex flex-col gap-2">
            <label htmlFor="additionalNotes" className="text-sm">
              Additional Notes (Optional)
            </label>
            <textarea
              type="text"
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleFormInputChange(e)}
              autoComplete="off"
              className="border bg-transparent  border-lightGray p-2 rounded-md focus:outline-blue"
            ></textarea>
          </div>
          <div className="mt-8 flex justify-between">
            <div className="flex flex-col gap-2 items-start">
              <button type="submit" className="p-2">
                Save as draft
              </button>
              <button className="p-2">Preview</button>
            </div>
            <div className="flex flex-col gap-2 items-start">
              <Button pending={status === "pending"} size="sm">
                <FaPaperclip size={14} color="#f5f5f5" /> Send Invoice
              </Button>
              <button className="p-2">Print</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;
