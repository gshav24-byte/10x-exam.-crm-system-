📖 Technical Glossary (glossary.md) — 10X CRM

This document provides a technical glossary of 10 key terms used throughout the development of the 10X CRM application, complete with English definition sentences and Georgian explanations.

1. Authentication

English: Authentication is the security verification process that confirms the identity of a user attempting to log into a system.

ქართულად: ავტორიზაცია/აუტენტიფიკაცია არის მომხმარებლის ცნობის პროცესი (მაგალითად ელ-ფოსტით და პაროლით), რათა სისტემა დარწმუნდეს, რომ ლოგინს ნამდვილად ანგარიშის მფლობელი ასრულებს.

2. Session

English: A session represents an active login state persisted in browser storage to maintain access across multiple page navigations.

ქართულად: სესია არის დროებითი ჩანაწერი (ჩვენს პროექტში crm_session localStorage-ში), რომელიც ინახავს ინფორმაციას მომხმარებლის შესვლის შესახებ, რათა ყოველ გვერდზე გადასვლისას პაროლის ხელახლა შეყვანა არ დასჭირდეს.

3. Validation

English: Form validation checks whether user input data complies with specified format rules and security constraints prior to form submission.

ქართულად: ვალიდაცია არის მონაცემთა შემოწმება ფორმის გაგზავნამდე — მაგალითად, შეიცავს თუ არა ელ-ფოსტა @-ს, არის თუ არა პაროლი მინიმუმ 8 სიმბოლო ან არის თუ არა სავალდებულო ველები შევსებული.

4. Fetch API

English: The Fetch API provides a modern JavaScript interface for making asynchronous network HTTP requests to external web servers.

ქართულად: Fetch არის JavaScript-ის ჩაშენებული მექანიზმი, რომლის საშუალებითაც ასინქრონულად (გვერდის გადაუტვირთავად) ვუკავშირდებით სერვერს მონაცემების წამოსაღებად ან გასაგზავნად.

5. Endpoint

English: An endpoint is a specific URL location provided by an API where client applications send requests to access or modify resources.

ქართულად: ენდპოინტი არის კონკრეტული მისამართი სერვერზე (მაგალითად https://dummyjson.com/users), სადაც ჩვენი აპლიკაცია აგზავნის მოთხოვნას გარკვეული მონაცემების მისაღებად ან შესაცვლელად.

6. Request Method

English: An HTTP request method indicates the desired action to be performed on a target server resource, such as GET, POST, or DELETE.

ქართულად: Request Method (HTTP მეთოდი) განსაზღვრავს მოქმედების ტიპს სერვერზე: GET — მონაცემების წამოღება, POST — ახალი ჩანაწერის დამატება, PUT — რედაქტირება, ხოლო DELETE — წაშლა.

7. JSON (JavaScript Object Notation)

English: JSON is a lightweight text-based data interchange format used to structure data transmitted between web clients and servers.

ქართულად: JSON არის მსუბუქი ტექსტური ფორმატი მონაცემების შესანახად და გადასაცემად (მაგალითად ობიექტების localStorage-ში JSON.stringify-ით შენახვისას ან API-დან მიღებისას).

8. State

English: State refers to the current snapshot of application data stored in memory that directly determines what is rendered on the user interface.

ქართულად: State (მდგომარეობა) არის აპლიკაციაში არსებული მიმდინარე მონაცემთა ერთობლიობა (მაგალითად allClients მასივი RAM-ში), რომლის ნებისმიერი ცვლილებაც მომენტალურად ახლებს ეკრანს.

9. Event Listener

English: An event listener is a JavaScript function that waits for a specific user interaction or event to occur on a target DOM element.

ქართულად: Event Listener (მოვლენის მსმენელი) არის JS ფუნქცია, რომელიც ელოდება მომხმარებლის მოქმედებას DOM ელემენტზე (მაგალითად ღილაკზე დაჭერას click ან ფორმის გაგზავნას submit) და უშვებს შესაბამის კოდს.

10. Deployment

English: Deployment is the execution process of publishing a local application codebase to a live public server environment like Vercel or Netlify.

ქართულად: დეპლოი არის ლოკალურად კომპიუტერში აწყობილი პროექტის საჯარო ონლაინ სერვერზე (მაგ: Vercel, Netlify, GitHub Pages) ატვირთვა და გამოქვეყნება, რათა საიტზე შესვლა ნებისმიერ მსურველს შეეძლოს ბმულით.
