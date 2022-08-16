import { AppDataSource } from "./data-source"
import { User } from "./entity/User"
import {Photo} from "./entity/Photo"
AppDataSource.initialize().then(async () => {

    console.log("Inserting a new user into the database...")
    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    user.age = 25
    user.email = "daoxuanson15072001@gmail.com"
    user.password = "123456789"
    await AppDataSource.manager.save(user)
    console.log("Saved a new user with id: " + user.id)

    console.log("Loading users from the database...")
    const users = await AppDataSource.manager.find(User)
    const photo = new Photo()
    photo.name = "sieu anh hung"
    photo.filename = "sieuanhhung.jpg"
    photo.description = "is one hito"
    photo.isPublished = true
    photo.views = 25
    await AppDataSource.manager.save(photo);
    console.log("created Photo succesfully")
}).catch(error => console.log(error))
