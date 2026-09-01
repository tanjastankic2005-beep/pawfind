// =========================================
//  PAWFIND — prevod (EN / SR)
//  Pokriva javne stranice; admin panel ostaje na engleskom.
// =========================================

const PAWFIND_LANG_KEY = 'pawfind_lang';

const T = {

  en: {
    'nav.home': 'Home',
    'nav.browsePets': 'Browse Pets',
    'nav.favorites': 'Favorites',
    'nav.addPet': 'Add a pet',
    'nav.adopted': 'Adopted pets',
    'nav.contact': 'Contact us',
    'nav.login': 'Log in',
    'nav.signup': 'Sign up',
    'nav.hi': 'Hi, {name}',
    'nav.logout': 'Log out',

    'footer.tagline': 'Find your new best friend.',
    'footer.copyright': '© 2026 PawFind. A student project by Tanja Stankic.',

    'home.eyebrow': 'Their story begins with you.',
    'home.title': 'Find your new best friend.',
    'home.text': 'Every pet on PawFind is waiting for someone like you. Browse hundreds of rescues, meet the one, and give them a home.',
    'home.findPet': 'Find a pet',
    'home.howItWorks': 'How it works',
    'home.howEyebrow': 'How adoption works',
    'home.howTitle': 'Three steps to a new best friend',
    'home.howSubtitle': 'Adopting is simpler than most people think. Here is the whole process.',
    'home.step1Title': 'Browse',
    'home.step1Text': 'Search by species, age, size or city until someone catches your eye.',
    'home.step2Title': 'Apply',
    'home.step2Text': 'Fill in a short form about your home. It takes about five minutes.',
    'home.step3Title': 'Meet & adopt',
    'home.step3Text': 'The shelter contacts you, you meet the pet, and you take them home.',
    'home.whyEyebrow': 'Why adopt',
    'home.whyTitle': 'Every adoption saves two lives',
    'home.successEyebrow': 'Success story',
    'home.successTitle': 'Home at last. 🏡',
    'home.reason1Title': 'You give a home',
    'home.reason1Text': 'One pet leaves the shelter, and the free space saves the next one.',
    'home.reason2Title': 'Ready to go',
    'home.reason2Text': 'Most rescues are already vaccinated, chipped and health checked.',
    'home.reason3Title': 'They know',
    'home.reason3Text': 'Rescued animals bond deeply. Ask anyone who has adopted one.',
    'home.reason4Title': 'You support shelters',
    'home.reason4Text': 'Every adoption frees up food, space and time for animals still waiting.',
    'home.listPetTitle': 'Have a pet that needs a home?',
    'home.listPetText': 'If you or someone you know can no longer care for a pet, you can list them here. Our team reviews every submission before it goes live.',
    'home.listPetButton': 'List a pet',
    'home.ctaTitle': 'Ready to meet your new best friend?',
    'home.ctaText': 'Hundreds of rescues are waiting right now.',
    'home.ctaButton': 'Find a pet',

    'pets.pageTitle': 'Meet our pets',
    'pets.tagline': 'Their story can begin with you.',
    'pets.searchPlaceholder': 'Search by name…',
    'pets.allSpecies': 'All species',
    'pets.dogs': 'Dogs',
    'pets.cats': 'Cats',
    'pets.anyGender': 'Any gender',
    'pets.male': 'Male',
    'pets.female': 'Female',
    'pets.anyAge': 'Any age',
    'pets.baby': 'Baby',
    'pets.young': 'Young',
    'pets.adult': 'Adult',
    'pets.senior': 'Senior',
    'pets.anySize': 'Any size',
    'pets.small': 'Small',
    'pets.medium': 'Medium',
    'pets.large': 'Large',
    'pets.anyLocation': 'Any location',
    'pets.anyPersonality': 'Any personality',
    'pets.friendly': 'Friendly',
    'pets.playful': 'Playful',
    'pets.calm': 'Calm',
    'pets.energetic': 'Energetic',
    'pets.affectionate': 'Affectionate',
    'pets.sortNewest': 'Newest first',
    'pets.sortNameAsc': 'Name A–Z',
    'pets.sortNameDesc': 'Name Z–A',
    'pets.sortYoungest': 'Youngest first',
    'pets.sortOldest': 'Oldest first',
    'pets.reset': 'Reset',
    'pets.countFound': '{n} {word} found',
    'pets.viewDetails': 'View details',
    'pets.noDescription': 'No description provided.',
    'pets.loading': 'Loading…',
    'pets.noMatch': 'No pets match your search. Try changing the filters.',
    'pets.loadError': 'Could not load pets. Is the server running?',
    'pets.somethingWrong': 'Something went wrong',
    'pets.removeFromFavorites': 'Remove from favorites',
    'pets.addToFavorites': 'Add to favorites',
    'pets.lookingForHome': 'Looking for their forever home ❤️',

    'petDetails.backLink': '← Back to all pets',
    'petDetails.loading': 'Loading…',
    'petDetails.noLongerAvailable': 'This pet is no longer available.',
    'petDetails.couldNotLoad': 'Could not load this pet. Is the server running?',
    'petDetails.noSelection': 'No pet selected.',
    'petDetails.mixedBreed': 'Mixed breed',
    'petDetails.age': 'Age',
    'petDetails.gender': 'Gender',
    'petDetails.size': 'Size',
    'petDetails.personality': 'Personality',
    'petDetails.goodToKnow': 'Good to know',
    'petDetails.vaccinated': 'Vaccinated',
    'petDetails.neutered': 'Neutered / spayed',
    'petDetails.goodWithKids': 'Good with kids',
    'petDetails.goodWithDogs': 'Good with dogs',
    'petDetails.goodWithCats': 'Good with cats',
    'petDetails.yes': '✓ Yes',
    'petDetails.no': '✕ No',
    'petDetails.applyButton': 'Apply to adopt',
    'petDetails.noDescription': 'No description provided.',

    'favorites.pageTitle': 'My favourites',
    'favorites.loading': 'Loading…',
    'favorites.countSaved': '{n} {word} saved',
    'favorites.loginPrompt': 'Log in to see the pets you saved.',
    'favorites.noneSaved': 'You have not saved any pets yet.',
    'favorites.loadError': 'Could not load your favourites. Is the server running?',
    'favorites.somethingWrong': 'Something went wrong',

    'adopted.pageTitle': 'Pets who found a new home',
    'adopted.pageSubtitle': 'Every pet here already has a family. Thank you to everyone who opened their door.',
    'adopted.loading': 'Loading…',
    'adopted.badge': '🏠 Found their home!',
    'adopted.countLabel': '{n} {word} found a new home',
    'adopted.noneYet': 'No pets have been adopted yet. Check back soon!',
    'adopted.loadError': 'Could not load adopted pets. Is the server running?',
    'adopted.dateOnly': 'Adopted on {date}',
    'adopted.dateAndBy': 'Adopted on {date} — new family: {name}',
    'adopted.noDateInfo': 'This pet has already found a home.',

    'auth.loginTitle': 'Welcome back',
    'auth.loginSubtitle': 'Log in to see your favourites and applications.',
    'auth.emailLabel': 'Email',
    'auth.passwordLabel': 'Password',
    'auth.loginButton': 'Log in',
    'auth.noAccountYet': 'No account yet?',
    'auth.signUp': 'Sign up',
    'auth.loggingIn': 'Logging in…',
    'auth.invalidCredentials': 'Invalid email or password.',
    'auth.genericError': 'Something went wrong. Please try again.',
    'auth.emailInvalid': 'Please enter a valid email address.',
    'auth.enterPassword': 'Please enter your password.',
    'auth.registerTitle': 'Create your account',
    'auth.registerSubtitle': 'Save your favourite pets and follow your adoption applications.',
    'auth.fullNameLabel': 'Full name',
    'auth.passwordHint': 'At least 8 characters.',
    'auth.repeatPasswordLabel': 'Repeat password',
    'auth.createAccountButton': 'Create account',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.logIn': 'Log in',
    'auth.creatingAccount': 'Creating account…',
    'auth.nameRequired': 'Please enter your name.',
    'auth.passwordTooShort': 'Password must be at least 8 characters.',
    'auth.passwordsMismatch': 'Passwords do not match.',
    'auth.emailTaken': 'An account with this email already exists.',
    'auth.welcome': 'Welcome, {name}! 🐾',
    'auth.accountCreated': 'Your account has been created.',

    'apply.pageTitle': 'Adoption application',
    'apply.pageSubtitle': 'Tell us a little about your home. The shelter will contact you within a few days.',
    'apply.applyingTo': 'You are applying to adopt',
    'apply.fullNameLabel': 'Full name',
    'apply.emailLabel': 'Email',
    'apply.phoneLabel': 'Phone',
    'apply.cityLabel': 'City',
    'apply.housingLabel': 'Housing type',
    'apply.housingChoose': 'Choose…',
    'apply.apartment': 'Apartment',
    'apply.house': 'House',
    'apply.farm': 'Farm / rural property',
    'apply.yourHomeLegend': 'Your home',
    'apply.hasYard': 'I have a yard or garden',
    'apply.hasOtherPets': 'I already have other pets',
    'apply.hasChildren': 'There are children in the house',
    'apply.experienceLabel': 'Experience with pets',
    'apply.experiencePlaceholder': 'Have you had pets before?',
    'apply.reasonLabel': 'Why do you want to adopt?',
    'apply.reasonPlaceholder': 'Tell the shelter a bit about yourself and your home.',
    'apply.contactMethodLegend': 'Preferred contact method',
    'apply.contactEmail': 'Email',
    'apply.contactPhone': 'Phone',
    'apply.sendButton': 'Send application',
    'apply.sendingButton': 'Sending…',
    'apply.thankYou': 'Thank you! 🐾',
    'apply.received': 'Your application has been received.',
    'apply.reference': 'Reference number:',
    'apply.contactSoon': 'The shelter will contact you within a few days.',
    'apply.browseMore': 'Browse more pets',
    'apply.fixFollowing': 'Please fix the following:',
    'apply.genericError': 'Something went wrong. Please try again.',
    'apply.nameError': 'Please enter your full name.',
    'apply.emailError': 'Please enter a valid email address.',
    'apply.reasonError': 'Please write at least 10 characters.',
    'apply.noSelection': 'No pet selected.',
    'apply.noLongerAvailable': 'This pet is no longer available.',

    'addPet.pageTitle': 'List a pet for adoption',
    'addPet.pageSubtitle': 'Know a pet that needs a new home? Tell us about them below. Every listing is reviewed by our team before it goes live.',
    'addPet.nameLabel': 'Name',
    'addPet.breedLabel': 'Breed',
    'addPet.speciesLabel': 'Species',
    'addPet.dog': 'Dog',
    'addPet.cat': 'Cat',
    'addPet.ageLabel': 'Age (years)',
    'addPet.genderLabel': 'Gender',
    'addPet.female': 'Female',
    'addPet.male': 'Male',
    'addPet.sizeLabel': 'Size',
    'addPet.small': 'Small',
    'addPet.medium': 'Medium',
    'addPet.large': 'Large',
    'addPet.locationLabel': 'Location',
    'addPet.personalityLabel': 'Personality',
    'addPet.photosLabel': 'Photos',
    'addPet.photosHint': 'Click to choose photos, or drag them here. You can select several at once.',
    'addPet.photosSelected': '{n} {word} selected — click or drag to add more.',
    'addPet.descriptionLabel': 'Description',
    'addPet.descriptionPlaceholder': 'Tell us about their personality, history and needs.',
    'addPet.detailsLegend': 'Details',
    'addPet.vaccinated': 'Vaccinated',
    'addPet.neutered': 'Neutered / spayed',
    'addPet.kids': 'Good with kids',
    'addPet.dogs': 'Good with dogs',
    'addPet.cats': 'Good with cats',
    'addPet.submitButton': 'Submit for review',
    'addPet.submittingButton': 'Submitting…',
    'addPet.thankYou': 'Thank you! 🐾',
    'addPet.submittedText': 'Your pet has been submitted and is waiting for our team to review it.',
    'addPet.appearText': 'Once approved, it will appear on the Browse Pets page.',
    'addPet.browseButton': 'Browse pets',
    'addPet.needAccount': 'You need an account to list a pet for adoption.',
    'addPet.loginButton': 'Log in',
    'addPet.couldNotLoad': 'Could not load this page.',
    'addPet.genericError': 'Something went wrong. Please try again.',

    'contact.pageTitle': 'Contact us',
    'contact.pageSubtitle': 'Questions, feedback, or something not working right? Send us a message.',
    'contact.nameLabel': 'Your name',
    'contact.emailLabel': 'Email',
    'contact.messageLabel': 'Message',
    'contact.messagePlaceholder': 'How can we help?',
    'contact.sendButton': 'Send message',
    'contact.sendingButton': 'Sending…',
    'contact.sentTitle': 'Message sent 🐾',
    'contact.sentText': 'Thanks for reaching out — we will get back to you by email soon.',
    'contact.backHome': 'Back to home',
    'contact.fixFollowing': 'Please fix the following:',
    'contact.genericError': 'Something went wrong. Please try again.',
    'contact.nameError': 'Please enter your name.',
    'contact.emailError': 'Please enter a valid email address.',
    'contact.messageError': 'Please write at least 10 characters.',

    'profile.loading': 'Loading…',
    'profile.loginPrompt': 'Log in to see your profile, favourites and applications.',
    'profile.loginButton': 'Log in',
    'profile.noApplications': 'You have not applied for any pet yet.',
    'profile.browseButton': 'Browse pets',
    'profile.memberSince': 'Member since {date}',
    'profile.savedPetsStat': 'Saved pets',
    'profile.applicationsStat': 'Applications',
    'profile.approvedStat': 'Approved',
    'profile.myApplications': 'My applications',
    'profile.savedPetsTitle': 'Saved pets',
    'profile.seeAllFavorites': 'See all favourites →',
    'profile.viewPet': 'View pet →',
    'profile.couldNotLoad': 'Could not load your profile. Is the server running?',
    'profile.applied': 'Applied {date}',

    'status.pending':     'Pending',
    'status.underReview': 'Under Review',
    'status.approved':    'Approved',
    'status.rejected':    'Rejected',
    'status.completed':   'Completed'
  },

  sr: {
    'nav.home': 'Početna',
    'nav.browsePets': 'Pregled ljubimaca',
    'nav.favorites': 'Favoriti',
    'nav.addPet': 'Dodaj ljubimca',
    'nav.adopted': 'Udomljeni ljubimci',
    'nav.contact': 'Kontakt',
    'nav.login': 'Prijava',
    'nav.signup': 'Registracija',
    'nav.hi': 'Zdravo, {name}',
    'nav.logout': 'Odjava',

    'footer.tagline': 'Pronađite svog novog najboljeg prijatelja.',
    'footer.copyright': '© 2026 PawFind. Studentski projekat, autor: Tanja Stankić.',

    'home.eyebrow': 'Njihova priča počinje s tobom.',
    'home.title': 'Pronađite svog novog najboljeg prijatelja.',
    'home.text': 'Svaki ljubimac na PawFind-u čeka baš vas. Pregledajte stotine ljubimaca za udomljavanje, upoznajte onog pravog i pružite mu dom.',
    'home.findPet': 'Pronađi ljubimca',
    'home.howItWorks': 'Kako funkcioniše',
    'home.howEyebrow': 'Kako funkcioniše udomljavanje',
    'home.howTitle': 'Tri koraka do novog najboljeg prijatelja',
    'home.howSubtitle': 'Udomljavanje je jednostavnije nego što većina ljudi misli. Evo cijelog procesa.',
    'home.step1Title': 'Pregledaj',
    'home.step1Text': 'Pretražuj po vrsti, starosti, veličini ili gradu dok ti neko ne zapadne za oko.',
    'home.step2Title': 'Prijavi se',
    'home.step2Text': 'Popuni kratku formu o svom domu. Traje oko pet minuta.',
    'home.step3Title': 'Upoznaj i udomi',
    'home.step3Text': 'Sklonište te kontaktira, upoznaš ljubimca i odvedeš ga kući.',
    'home.whyEyebrow': 'Zašto udomiti',
    'home.whyTitle': 'Svako udomljavanje spašava dva života',
    'home.successEyebrow': 'Priča o uspjehu',
    'home.successTitle': 'Sada je kod kuće. 🏡',
    'home.reason1Title': 'Pružate dom',
    'home.reason1Text': 'Jedan ljubimac napušta sklonište, a oslobođeno mjesto spašava sljedećeg.',
    'home.reason2Title': 'Spremni za polazak',
    'home.reason2Text': 'Većina ljubimaca je već vakcinisana, čipovana i zdravstveno pregledana.',
    'home.reason3Title': 'Oni znaju',
    'home.reason3Text': 'Udomljene životinje se duboko vežu. Pitajte bilo koga ko je udomio ljubimca.',
    'home.reason4Title': 'Podržavate sklonište',
    'home.reason4Text': 'Svako udomljavanje oslobađa hranu, prostor i vrijeme za životinje koje još čekaju.',
    'home.listPetTitle': 'Imate ljubimca kome treba dom?',
    'home.listPetText': 'Ako vi ili neko koga poznajete više ne može da brine o ljubimcu, možete ga prijaviti ovdje. Naš tim pregleda svaku prijavu prije nego što bude objavljena.',
    'home.listPetButton': 'Prijavi ljubimca',
    'home.ctaTitle': 'Spremni da upoznate svog novog najboljeg prijatelja?',
    'home.ctaText': 'Stotine ljubimaca za udomljavanje čekaju upravo sada.',
    'home.ctaButton': 'Pronađi ljubimca',

    'pets.pageTitle': 'Upoznajte naše ljubimce',
    'pets.tagline': 'Njihova priča može početi s tobom.',
    'pets.searchPlaceholder': 'Pretraga po imenu…',
    'pets.allSpecies': 'Sve vrste',
    'pets.dogs': 'Psi',
    'pets.cats': 'Mačke',
    'pets.anyGender': 'Bilo koji pol',
    'pets.male': 'Mužjak',
    'pets.female': 'Ženka',
    'pets.anyAge': 'Bilo koja starost',
    'pets.baby': 'Bebe',
    'pets.young': 'Mladi',
    'pets.adult': 'Odrasli',
    'pets.senior': 'Stariji',
    'pets.anySize': 'Bilo koja veličina',
    'pets.small': 'Mali',
    'pets.medium': 'Srednji',
    'pets.large': 'Veliki',
    'pets.anyLocation': 'Bilo koja lokacija',
    'pets.anyPersonality': 'Bilo koji temperament',
    'pets.friendly': 'Druželjubiv',
    'pets.playful': 'Razigran',
    'pets.calm': 'Miran',
    'pets.energetic': 'Energičan',
    'pets.affectionate': 'Nježan',
    'pets.sortNewest': 'Najnovije prvo',
    'pets.sortNameAsc': 'Ime A–Š',
    'pets.sortNameDesc': 'Ime Š–A',
    'pets.sortYoungest': 'Najmlađi prvo',
    'pets.sortOldest': 'Najstariji prvo',
    'pets.reset': 'Poništi',
    'pets.countFound': '{n} {word} pronađeno',
    'pets.viewDetails': 'Detalji',
    'pets.noDescription': 'Opis nije unesen.',
    'pets.loading': 'Učitavanje…',
    'pets.noMatch': 'Nijedan ljubimac ne odgovara pretrazi. Pokušajte promijeniti filtere.',
    'pets.loadError': 'Ne mogu se učitati ljubimci. Da li server radi?',
    'pets.somethingWrong': 'Nešto nije u redu',
    'pets.removeFromFavorites': 'Ukloni iz favorita',
    'pets.addToFavorites': 'Dodaj u favorite',
    'pets.lookingForHome': 'Traži svoj novi dom ❤️',

    'petDetails.backLink': '← Nazad na sve ljubimce',
    'petDetails.loading': 'Učitavanje…',
    'petDetails.noLongerAvailable': 'Ovaj ljubimac više nije dostupan.',
    'petDetails.couldNotLoad': 'Ne mogu učitati ovog ljubimca. Da li server radi?',
    'petDetails.noSelection': 'Nijedan ljubimac nije izabran.',
    'petDetails.mixedBreed': 'Mješana rasa',
    'petDetails.age': 'Starost',
    'petDetails.gender': 'Pol',
    'petDetails.size': 'Veličina',
    'petDetails.personality': 'Temperament',
    'petDetails.goodToKnow': 'Korisno je znati',
    'petDetails.vaccinated': 'Vakcinisan',
    'petDetails.neutered': 'Kastriran / sterilisana',
    'petDetails.goodWithKids': 'Dobar sa djecom',
    'petDetails.goodWithDogs': 'Dobar sa psima',
    'petDetails.goodWithCats': 'Dobar sa mačkama',
    'petDetails.yes': '✓ Da',
    'petDetails.no': '✕ Ne',
    'petDetails.applyButton': 'Prijavi se za udomljavanje',
    'petDetails.noDescription': 'Opis nije unesen.',

    'favorites.pageTitle': 'Moji favoriti',
    'favorites.loading': 'Učitavanje…',
    'favorites.countSaved': '{n} {word} sačuvano',
    'favorites.loginPrompt': 'Prijavite se da vidite sačuvane ljubimce.',
    'favorites.noneSaved': 'Još niste sačuvali nijednog ljubimca.',
    'favorites.loadError': 'Ne mogu učitati vaše favorite. Da li server radi?',
    'favorites.somethingWrong': 'Nešto nije u redu',

    'adopted.pageTitle': 'Ljubimci koji su pronašli novi dom',
    'adopted.pageSubtitle': 'Svaki od ovih ljubimaca sada ima porodicu. Hvala svima koji su otvorili vrata.',
    'adopted.loading': 'Učitavanje…',
    'adopted.badge': '🏠 Pronašao/la je svoj dom!',
    'adopted.countLabel': '{n} {word} {participle}',
    'adopted.noneYet': 'Još nijedan ljubimac nije udomljen. Navratite uskoro!',
    'adopted.loadError': 'Ne mogu se učitati udomljeni ljubimci. Da li server radi?',
    'adopted.dateOnly': 'Udomljen/a {date}',
    'adopted.dateAndBy': 'Udomljen/a {date} — nova porodica: {name}',
    'adopted.noDateInfo': 'Ovaj ljubimac je već pronašao dom.',

    'auth.loginTitle': 'Dobrodošli nazad',
    'auth.loginSubtitle': 'Prijavite se da vidite svoje favorite i prijave.',
    'auth.emailLabel': 'Email',
    'auth.passwordLabel': 'Lozinka',
    'auth.loginButton': 'Prijava',
    'auth.noAccountYet': 'Nemate nalog?',
    'auth.signUp': 'Registruj se',
    'auth.loggingIn': 'Prijavljivanje…',
    'auth.invalidCredentials': 'Pogrešan email ili lozinka.',
    'auth.genericError': 'Nešto nije u redu. Pokušajte ponovo.',
    'auth.emailInvalid': 'Unesite ispravnu email adresu.',
    'auth.enterPassword': 'Unesite svoju lozinku.',
    'auth.registerTitle': 'Napravite nalog',
    'auth.registerSubtitle': 'Sačuvajte omiljene ljubimce i pratite svoje prijave za udomljavanje.',
    'auth.fullNameLabel': 'Ime i prezime',
    'auth.passwordHint': 'Najmanje 8 karaktera.',
    'auth.repeatPasswordLabel': 'Ponovite lozinku',
    'auth.createAccountButton': 'Napravi nalog',
    'auth.alreadyHaveAccount': 'Već imate nalog?',
    'auth.logIn': 'Prijavite se',
    'auth.creatingAccount': 'Kreiranje naloga…',
    'auth.nameRequired': 'Unesite svoje ime.',
    'auth.passwordTooShort': 'Lozinka mora imati najmanje 8 karaktera.',
    'auth.passwordsMismatch': 'Lozinke se ne poklapaju.',
    'auth.emailTaken': 'Nalog sa ovim emailom već postoji.',
    'auth.welcome': 'Dobrodošli, {name}! 🐾',
    'auth.accountCreated': 'Vaš nalog je kreiran.',

    'apply.pageTitle': 'Prijava za udomljavanje',
    'apply.pageSubtitle': 'Recite nam nešto o svom domu. Sklonište će vas kontaktirati u narednih nekoliko dana.',
    'apply.applyingTo': 'Prijavljujete se za udomljavanje',
    'apply.fullNameLabel': 'Ime i prezime',
    'apply.emailLabel': 'Email',
    'apply.phoneLabel': 'Telefon',
    'apply.cityLabel': 'Grad',
    'apply.housingLabel': 'Tip smještaja',
    'apply.housingChoose': 'Izaberite…',
    'apply.apartment': 'Stan',
    'apply.house': 'Kuća',
    'apply.farm': 'Farma / seosko imanje',
    'apply.yourHomeLegend': 'Vaš dom',
    'apply.hasYard': 'Imam dvorište ili baštu',
    'apply.hasOtherPets': 'Već imam druge ljubimce',
    'apply.hasChildren': 'U kući ima djece',
    'apply.experienceLabel': 'Iskustvo sa ljubimcima',
    'apply.experiencePlaceholder': 'Da li ste ranije imali ljubimce?',
    'apply.reasonLabel': 'Zašto želite da udomite ljubimca?',
    'apply.reasonPlaceholder': 'Recite skloništu nešto o sebi i svom domu.',
    'apply.contactMethodLegend': 'Poželjan način kontakta',
    'apply.contactEmail': 'Email',
    'apply.contactPhone': 'Telefon',
    'apply.sendButton': 'Pošalji prijavu',
    'apply.sendingButton': 'Slanje…',
    'apply.thankYou': 'Hvala vam! 🐾',
    'apply.received': 'Vaša prijava je primljena.',
    'apply.reference': 'Referentni broj:',
    'apply.contactSoon': 'Sklonište će vas kontaktirati u narednih nekoliko dana.',
    'apply.browseMore': 'Pregledaj još ljubimaca',
    'apply.fixFollowing': 'Molimo ispravite sljedeće:',
    'apply.genericError': 'Nešto nije u redu. Pokušajte ponovo.',
    'apply.nameError': 'Unesite svoje ime i prezime.',
    'apply.emailError': 'Unesite ispravnu email adresu.',
    'apply.reasonError': 'Napišite najmanje 10 karaktera.',
    'apply.noSelection': 'Nijedan ljubimac nije izabran.',
    'apply.noLongerAvailable': 'Ovaj ljubimac više nije dostupan.',

    'addPet.pageTitle': 'Prijavi ljubimca za udomljavanje',
    'addPet.pageSubtitle': 'Znate ljubimca kome treba novi dom? Recite nam nešto o njemu ispod. Naš tim pregleda svaku prijavu prije nego što bude objavljena.',
    'addPet.nameLabel': 'Ime',
    'addPet.breedLabel': 'Rasa',
    'addPet.speciesLabel': 'Vrsta',
    'addPet.dog': 'Pas',
    'addPet.cat': 'Mačka',
    'addPet.ageLabel': 'Starost (godine)',
    'addPet.genderLabel': 'Pol',
    'addPet.female': 'Ženka',
    'addPet.male': 'Mužjak',
    'addPet.sizeLabel': 'Veličina',
    'addPet.small': 'Mali',
    'addPet.medium': 'Srednji',
    'addPet.large': 'Veliki',
    'addPet.locationLabel': 'Lokacija',
    'addPet.personalityLabel': 'Temperament',
    'addPet.photosLabel': 'Fotografije',
    'addPet.photosHint': 'Kliknite da izaberete fotografije ili ih prevucite ovdje. Možete izabrati više odjednom.',
    'addPet.photosSelected': '{n} {word} izabrano — kliknite ili prevucite da dodate još.',
    'addPet.descriptionLabel': 'Opis',
    'addPet.descriptionPlaceholder': 'Recite nam nešto o karakteru, prošlosti i potrebama ljubimca.',
    'addPet.detailsLegend': 'Detalji',
    'addPet.vaccinated': 'Vakcinisan',
    'addPet.neutered': 'Kastriran / sterilisana',
    'addPet.kids': 'Dobar sa djecom',
    'addPet.dogs': 'Dobar sa psima',
    'addPet.cats': 'Dobar sa mačkama',
    'addPet.submitButton': 'Pošalji na pregled',
    'addPet.submittingButton': 'Slanje…',
    'addPet.thankYou': 'Hvala vam! 🐾',
    'addPet.submittedText': 'Vaš ljubimac je prijavljen i čeka da ga naš tim pregleda.',
    'addPet.appearText': 'Nakon odobrenja, pojaviće se na stranici za pregled ljubimaca.',
    'addPet.browseButton': 'Pregledaj ljubimce',
    'addPet.needAccount': 'Potreban vam je nalog da biste prijavili ljubimca za udomljavanje.',
    'addPet.loginButton': 'Prijava',
    'addPet.couldNotLoad': 'Ne mogu učitati ovu stranicu.',
    'addPet.genericError': 'Nešto nije u redu. Pokušajte ponovo.',

    'contact.pageTitle': 'Kontakt',
    'contact.pageSubtitle': 'Imate pitanje, prijedlog ili nešto ne radi kako treba? Pošaljite nam poruku.',
    'contact.nameLabel': 'Vaše ime',
    'contact.emailLabel': 'Email',
    'contact.messageLabel': 'Poruka',
    'contact.messagePlaceholder': 'Kako možemo pomoći?',
    'contact.sendButton': 'Pošalji poruku',
    'contact.sendingButton': 'Slanje…',
    'contact.sentTitle': 'Poruka je poslata 🐾',
    'contact.sentText': 'Hvala što ste nam se javili — uskoro ćemo vam odgovoriti putem emaila.',
    'contact.backHome': 'Nazad na početnu',
    'contact.fixFollowing': 'Molimo ispravite sljedeće:',
    'contact.genericError': 'Nešto nije u redu. Pokušajte ponovo.',
    'contact.nameError': 'Unesite svoje ime.',
    'contact.emailError': 'Unesite ispravnu email adresu.',
    'contact.messageError': 'Napišite najmanje 10 karaktera.',

    'profile.loading': 'Učitavanje…',
    'profile.loginPrompt': 'Prijavite se da vidite svoj profil, favorite i prijave.',
    'profile.loginButton': 'Prijava',
    'profile.noApplications': 'Još se niste prijavili ni za jednog ljubimca.',
    'profile.browseButton': 'Pregledaj ljubimce',
    'profile.memberSince': 'Član od {date}',
    'profile.savedPetsStat': 'Sačuvani ljubimci',
    'profile.applicationsStat': 'Prijave',
    'profile.approvedStat': 'Odobreno',
    'profile.myApplications': 'Moje prijave',
    'profile.savedPetsTitle': 'Sačuvani ljubimci',
    'profile.seeAllFavorites': 'Pogledaj sve favorite →',
    'profile.viewPet': 'Pogledaj ljubimca →',
    'profile.couldNotLoad': 'Ne mogu učitati vaš profil. Da li server radi?',
    'profile.applied': 'Prijavljeno {date}',

    'status.pending':     'Na čekanju',
    'status.underReview': 'U razmatranju',
    'status.approved':    'Odobreno',
    'status.rejected':    'Odbijeno',
    'status.completed':   'Završeno'
  }

};


// ---- Osnovne funkcije ----
function getLang() {
  return localStorage.getItem(PAWFIND_LANG_KEY) || 'en';
}

function t(key, vars) {
  const lang = getLang();
  let str = (T[lang] && T[lang][key]) || T.en[key] || key;

  if (vars) {
    for (const name in vars) {
      str = str.replaceAll(`{${name}}`, vars[name]);
    }
  }

  return str;
}

function setLang(lang) {
  localStorage.setItem(PAWFIND_LANG_KEY, lang);
  document.documentElement.lang = lang;
  applyTranslations();
  updateLangSwitchUI();
  window.dispatchEvent(new CustomEvent('pawfind:langchange'));
}


// ---- Množina za brojeve (1 ljubimac / 2 ljubimca / 5 ljubimaca) ----
function serbianPlural(n, one, few, many) {
  const mod10  = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function tYearsWord(n) {
  return getLang() === 'sr'
    ? serbianPlural(n, 'godina', 'godine', 'godina')
    : (n === 1 ? 'year' : 'years');
}

function tPetsWord(n) {
  return getLang() === 'sr'
    ? serbianPlural(n, 'ljubimac', 'ljubimca', 'ljubimaca')
    : (n === 1 ? 'pet' : 'pets');
}

// Slaganje participa "udomljen" sa brojem (1 udomljen, 2-4 udomljena, 5+ udomljeno)
function tAdoptedParticiple(n) {
  return serbianPlural(n, 'udomljen', 'udomljena', 'udomljeno');
}

function tPhotosWord(n) {
  return getLang() === 'sr'
    ? serbianPlural(n, 'fotografija', 'fotografije', 'fotografija')
    : (n === 1 ? 'photo' : 'photos');
}


// ---- Prevod vrijednosti iz baze (species/size/gender su uskladištene na engleskom) ----
function tSpecies(species) {
  return species === 'dog' ? t('addPet.dog') : t('addPet.cat');
}

function tSize(size) {
  return t(`pets.${size}`);
}

function tGender(gender) {
  return gender === 'male' ? t('pets.male') : t('pets.female');
}

function tPersonality(personality) {
  return personality ? t(`pets.${personality}`) : '—';
}

// Opis ljubimca: koristi srpski opis ako postoji i jezik je SR, inače engleski.
function tDescription(pet) {
  if (getLang() === 'sr' && pet.description_sr) return pet.description_sr;
  return pet.description || t('pets.noDescription');
}

const APP_STATUS_KEYS = {
  'Pending':      'status.pending',
  'Under Review': 'status.underReview',
  'Approved':     'status.approved',
  'Rejected':     'status.rejected',
  'Completed':    'status.completed'
};

function tAppStatus(status) {
  const key = APP_STATUS_KEYS[status];
  return key ? t(key) : status;
}


// ---- Primjena prevoda na trenutni DOM ----
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}


// ---- Prekidač jezika u zaglavlju ----
function buildLangSwitch() {
  const headerInner = document.querySelector('.header-inner');
  if (!headerInner || headerInner.querySelector('.lang-switch')) return;

  const wrap = document.createElement('div');
  wrap.className = 'lang-switch';
  wrap.innerHTML = `
    <button type="button" data-lang="en">EN</button>
    <button type="button" data-lang="sr">SR</button>
  `;

  headerInner.appendChild(wrap);

  wrap.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-lang]');
    if (button) setLang(button.dataset.lang);
  });
}

function updateLangSwitchUI() {
  const lang = getLang();
  document.querySelectorAll('.lang-switch button').forEach(button => {
    button.classList.toggle('is-active', button.dataset.lang === lang);
  });
}


// ---- Start ----
document.documentElement.lang = getLang();

document.addEventListener('DOMContentLoaded', () => {
  buildLangSwitch();
  updateLangSwitchUI();
  applyTranslations();
});
