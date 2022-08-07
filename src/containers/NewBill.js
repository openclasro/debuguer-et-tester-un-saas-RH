import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    this.messageError = this.document.querySelector(`p[data-testid="message"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    this.validFile = false
   
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile =(e)  => {
    e.preventDefault();
    const file = e.target.files[0]


    const fileName = e.target.files[0].name
    const email = JSON.parse(localStorage.getItem("user")).email
    const fileType = fileName.split('.').pop();
    const formData = new FormData()
    
 

    if(['jpeg','jpg','png'].includes(fileType.toLowerCase())){  // tester si le type du fichier ajouter dans le formulaire est de type "jpeg","jpg","png" 
      
     
 
    
    formData.append('file', file)
    formData.append('email', email)

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        this.validFile = true
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName

        
      }).catch(error =>  {
        this.validFile = false
        // console.error(error)
        return this.validFile
      }
        
     
      )

    }else{
      this.validFile = false;
      e.target.value = "";
      this.messageError.classList.remove("hidden")
      
    }
      return this.validFile;
  }
  handleSubmit = e => {
    e.preventDefault()
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      }).catch(error => {
        console.error(error)
      })
    }
  }
}