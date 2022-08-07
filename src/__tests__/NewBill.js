/**
 * @jest-environment jsdom
 */
import {screen, waitFor, fireEvent} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import mockStore from "../__mocks__/store.js"
import { bills } from "../fixtures/bills.js"
import userEvent from '@testing-library/user-event'
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import {ROUTES ,ROUTES_PATH} from "../constants/routes.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.className).toBe('active-icon')
      



    })

    
    test("Then they are a from to edit NewBill", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const contentTitle = screen.getAllByText('Envoyer une note de frais')
      expect(contentTitle).toBeTruthy()
    })
    
   })

   describe("When I am on NewBill Page and i click on button choose file", () =>{
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })

      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      document.body.innerHTML = `<div id="root"></div>`
      router()
    })


    test('Then,I choose a good format of file', async () => {
      

     
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localeStorage: localStorageMock
      })
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener("change", handleChangeFile)
      const img = new File(['img'], 'image.png', {type:'image/png'})
      await waitFor(() => { userEvent.upload(inputFile, img) })
     
      expect(inputFile.files[0].name).toBe('image.png')
      expect(handleChangeFile).toBeCalled()
      expect(newBill.validFile).toBeTruthy()


        

      
      
    })

    test('Then, I choose a wrong format of file', async () => {
     
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: localStorageMock
      })
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      const errorMessage = screen.getByTestId("message");
      inputFile.addEventListener("change", handleChangeFile)
      const txt = new File(['Welcome to Websparrow.org.'], 'image.txt', { type: 'text/plaincharset=utf-8' })

      inputFile.addEventListener('change', handleChangeFile)
      await waitFor(() => { userEvent.upload(inputFile, txt) }) 

      expect(inputFile.files[0].name).toBe('image.txt')
      expect(handleChangeFile).toBeCalled()
      expect(newBill.validFile).not.toBeTruthy()
      expect(errorMessage.classList).not.toContain("hidden")






    })


 
    

  })
   //test d integration post

   describe("When I am on NewBill Page and submit the form", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
       jest.spyOn(console, 'error').mockImplementation(() => {})// Prevent Console.error jest error
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    describe("When I do fill fields in correct format", () => {
      test("Then I should send new Bill ticket'", async () => {
        const newBill = new NewBill({
          document, onNavigate, store: mockStore, localeStorage: localStorageMock
        })
        document.body.innerHTML = NewBillUI({ data: bills })
        const handleSubmit = jest.fn(newBill.handleSubmit)
        const form = screen.getByTestId("form-new-bill")
        form.addEventListener("submit", handleSubmit)
        fireEvent.submit(form)
        expect(handleSubmit).toHaveBeenCalled()

        
      })
    })
    describe("When I do fill fields in incorrect format", () => {
      test("Then it should display an error", async () => {
        window.onNavigate(ROUTES_PATH.NewBill)
        mockStore.bills.mockImplementationOnce(() => {
          return {
            update: () => {
              return Promise.reject(new Error("Erreur"))
            }
          }
        })
        const newBill = new NewBill({
          document, onNavigate, store: mockStore, localeStorage: localStorageMock
        })
        document.body.innerHTML = NewBillUI({ data: bills })
        const handleSubmit = jest.fn(newBill.handleSubmit)
        const form = screen.getByTestId("form-new-bill")
        form.addEventListener("submit", handleSubmit)
        fireEvent.submit(form)
        await new Promise(process.nextTick);
        expect(console.error).toBeCalled()
        
        
  
      })
    })
  })
  })


