📄 Research Note (research-note.md) — 10X CRM

This document details the technical research conducted using official English documentation during the implementation of the 10X CRM application.

🔗 Referenced Source

Document Name: DummyJSON Documentation — Users Resource

URL: https://dummyjson.com/docs/users

Search Keywords Used: "DummyJSON users endpoint pagination fetch mock users api post delete"

📝 ქართული რეზიუმე (Georgian Technical Summary)

დოკუმენტაციის გაცნობის შედეგად დეტალურად შევისწავლე DummyJSON API-ის მომხმარებელთა (/users) ენდპოინტის ფუნქციონალი, რომელიც გამოიყენება CRM სისტემისთვის რეალისტური სატესტო მონაცემების ასინქრონულად წამოსაღებად.

გავაანალიზე, თუ როგორ მუშაობს GET https://dummyjson.com/users?limit=30 მოთხოვნა და რა სტრუქტურის JSON ობიექტს აბრუნებს API (მაგალითად: firstName, lastName, email, phone, company.name და image).

შევამოწმე POST /users/add და DELETE /users/{id} მეთოდების სპეციფიკა და დოკუმენტაციიდან შევიტყვე, რომ DummyJSON სერვერი ამ ოპერაციების იმიტაციას აკეთებს — წარმატებულ პასუხს აბრუნებს, თუმცა თავის ცენტრალურ ბაზას არ ცვლის.

ამ ტექნიკურ მიგნებაზე დაყრდნობით მივიღე არქიტექტურული გადაწყვეტილება, რომ API-დან წამოღებული პირველადი მონაცემები localStorage-ში (crm_clients გასაღებით) შეგვენახა და ყველა შემდგომი CRUD ცვლილება ლოკალურ მეხსიერებაშივე გაგვეგრძელებინა.

ასევე, დოკუმენტაციის წყალობით წინასწარ განვსაზღვრე, რომ ჩვენ მიერ ხელით დამატებული კლიენტის წაშლისას (DELETE) სერვერი 404 შეცდომას დააბრუნებდა, რის გამოც კოდში დავწერე ლოგიკა, რომ 404-ის შემთხვევაშიც კლიენტი ლოკალური localStorage მასივიდან მაინც უსაფრთხოდ წაიშალოს.

საბოლოო ჯამში, ამ რესურსის გამოყენებამ მომცა სრული ცოდნა, თუ როგორ მუშაობს სერვერთან fetch() ასინქრონული კომუნიკაცია, HTTP request მეთოდები და try/catch შეცდომების დამუშავება.
