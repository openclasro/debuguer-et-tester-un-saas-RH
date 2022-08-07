/**
 * @jest-environment jsdom
 */
 import "@testing-library/jest-dom"
  // import { screen, getByTestId, getAllByTestId, getByText, waitFor } from "@testing-library/dom"
import {screen, waitFor,fireEvent} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
 import mockStore from '../__mocks__/store'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES ,ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from '../containers/Bills.js';
import router from "../app/Router.js";

 jest.mock("../app/store", () => mockStore)
 
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.className).toBe('active-icon')



    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    
  })
  describe('When I am on bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({loading: false, error: true })
      expect(screen.getByTestId('error-message')).toBeTruthy()
    })
  })

  describe('When I am on Bills Page and click on new expens', () => {
    test('Then I should navigate to NewBills page',async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'employee'
      }))
      const billsPage = new Bills({
        document, onNavigate, store: null, bills: bills, localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({ data: bills })
        // on récupère la fonction pour le test
        const handleClickNewBill = jest.fn((e) => billsPage.handleClickNewBill())
        // on récupère l'accès au bouton qui dirige vers la page souhaitée
        const buttonNewBill = screen.getByTestId('btn-new-bill');
        //  expect(buttonNewBill).toBeTruthy();
        // on simule l'action
        buttonNewBill.addEventListener("click", handleClickNewBill)
        userEvent.click(buttonNewBill);
        // on vérifie que la fonction est appelée et que la page souhaitée s'affiche
        expect(handleClickNewBill).toHaveBeenCalled()
         expect(screen.getAllByText("Envoyer une note de frais")
         ).toBeTruthy()
        await waitFor(() => screen.getByTestId("form-new-bill"))
        expect(screen.getByTestId("form-new-bill")).toBeTruthy()

    })
  })
  describe('When I am on Bills Page and i click on icon Eye ', () => {
    test("Then modal with supporting documents it  open", () => {
      Object.defineProperty(window, localStorage, {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee" })
      );
      document.body.innerHTML = BillsUI({
        data: bills,
      });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname,
        });
      };
      const billsJs = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });

      $.fn.modal = jest.fn();

      const handleClick = jest.fn((e) => billsJs.handleClickIconEye);
      const iconEye = screen.queryAllByTestId("icon-eye")[0];
      expect(iconEye).toBeTruthy();
      
      iconEye.addEventListener("click", handleClick);
      fireEvent.click(iconEye);
      expect(handleClick).toHaveBeenCalled();
   
    });
  });  
  });


// Test d'integration GET

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('fetches bills from mock API GET', async () => { 
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['Bills'] } })
  
      localStorage.setItem('user', JSON.stringify({ type: 'Employee',email:'a@a' }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root) 
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      
      expect(await waitFor(() => screen.getByText('Mes notes de frais'))).toBeTruthy()
      expect(await waitFor(() => screen.getByTestId('tbody'))).toBeTruthy()
      expect(screen.getAllByText('encore'))
    })
  })
  describe('When an error occurs on API', () => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills')
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test('fetches bills from an API and fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error('Erreur 404'))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await waitFor(() => screen.getByText(/Erreur 404/))
      expect(message).toBeTruthy()
    })

    test('fetches messages from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error('Erreur 500'))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await waitFor(() => screen.getByText(/Erreur 500/))
      expect(message).toBeTruthy()
    })
  })
})
  






