import vue from 'vue'
import vuex from 'vuex'
import axios from 'axios'
import router from "../router"
import Buefy from 'buefy'
import 'buefy/lib/buefy.css'
import VCalendar from 'v-calendar';
import 'v-calendar/lib/v-calendar.min.css';

vue.use(Buefy)

vue.use(vuex)

vue.use(VCalendar, {
    firstDayOfWeek: 2,  // Monday
                    // ...other defaults
  });

var production = !window.location.host.includes('localhost');
var baseUrl = production ? '//herokuapp.com/' : '//localhost:3000';
var foodApi = 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes'

var genRecipeSearch = axios.create({
    headers: {
        "X-Mashape-Key" : "WUU1lLesMimshTMLlxjAtkQGQMk6p1JQPB5jsnLPJCHfNJbugE"
    },
    baseURL: foodApi + '/search?query=',
    timeout: 3000
})
var ingredientRecipeSearch = axios.create({
    headers: {
        "X-Mashape-Key" : "WUU1lLesMimshTMLlxjAtkQGQMk6p1JQPB5jsnLPJCHfNJbugE"
    },
    baseURL: foodApi + '/findByIngredients?fillIngredients=false&ingredients=',
    timeout: 3000
})
var recipeDetailsSearch = axios.create({
    headers: {
        "X-Mashape-Key" : "WUU1lLesMimshTMLlxjAtkQGQMk6p1JQPB5jsnLPJCHfNJbugE"
    },
    baseURL: foodApi,
    timeout: 3000
})
var api = axios.create({
    baseURL: baseUrl,
    timeout: 3000,
    withCredentials: true
})
var auth = axios.create({
    baseURL: baseUrl + "/auth",
    timeout: 3000,
    withCredentials: true
})

//suggested by darryl
// var ingredients =""
// var url = 'findbyingred'+ingredients+'limit=true'

export default new vuex.Store({
    state: {
        user: {},
        recipes: [],
        ingRecipes: [],
        recipe: {},
        groceryList: [],
        searchHistory: [],
        favorites: [],
        pantry: []
    
    },
    mutations: {
        deleteUser (state){
            state.user = {}
        },
        setUser(state, user) {
            state.user = user
        },
        setRecipes(state, recipes) {
            console.log(recipes)
            state.recipes = recipes
        },
        setGroceryList(state, groceryList) {
            state.groceryList = groceryList
        },
        setActiveRecipe(state, recipe) {
            state.recipe = this.recipe
        },
        setPantry(state, pantry) {
            state.pantry = pantry
        },
        setIngRecipes(state, ingRecipes){
            console.log(ingRecipes)
            state.ingRecipes = ingRecipes
        },
        setFavorites(state, favorites){
            console.log(favorites)
            state.favorites = favorites
        }
        
    },

    actions: {

        getSearchIngredients({dispatch, commit}, query) {
            ingredientRecipeSearch.get(query + '&number=10'+ '&limitLicense=false' + '&ranking=1')
            .then(res=>{ 
                console.log(res)
                var ingRecipes = res.data.map(recipe => {
                    return {
                        title: recipe.title,
                        image: recipe.image,

                        spoonId: recipe.id
                    }
                })
                commit('setIngRecipes', ingRecipes)
            })
        },
        

        // RecipesGeneral({ dispatch, commit }, query) {
        //     genRecipeSearch.get(query)
        //         .then(res => {
        //             var foodList = res.data.results.map(recipe => {
        //                 return {
        //                     title: recipe.title,
        //                     image: recipe.image,
        //                     minutesReady: recipe.readyInMinutes,
        //                     sourceUrl: recipe.source.Url,
        //                     instructions: recipe.instructions,
        //                     ingredients: recipe.extendedIngredients,
        //                     spoonId: recipe.id
        //                 }
        //             })
        //         })
        // },
        getSearchResults({dispatch, commit}, query) {
            genRecipeSearch.get(query + '&number=1')
            .then(res=>{
                var recipes = res.data.results.map(recipe => {
                    return {
                        title: recipe.title,
                        image: recipe.image,
                        readyInMinutes: recipe.readyInMinutes,
                        // sourceUrl: recipe.sourceUrl,
                        // instructions: recipe.instructions,
                        // ingredients: recipe.extendedIngredients,
                        spoonId: recipe.id
                    }
                })
                console.log(res)
                commit('setRecipes', recipes)
                router.push({name: 'GeneralSearchResults'})
            })
        },
        setRecipeDetails({dispatch, commit, state}, id){
            recipeDetailsSearch.get(id + '/information')
            .then(recipeDeets =>{
                console.log(recipeDeets)
                var recipe = {}
                recipe.title = recipeDeets.data.title,
                recipe.image = recipeDeets.data.image,
                recipe.readyInMinutes = recipeDeets.data.readyInMinutes,
                recipe.sourceUrl = recipeDeets.data.sourceUrl,
                recipe.instructions = recipeDeets.data.instructions ,
                recipe.ingredients = recipeDeets.data.extendedIngredients,
                recipe.spoonId = recipeDeets.data.id
                commit('setActiveRecipe', recipe)
            })
        },
        // getRecipeDetails({dispatch, commit}, id){
        //     recipeDetailsSearch.get(id + '/information')
        //     .then(res=>{
        //         console.log(res)
        //         var recipe = {}
        //         recipe.title = res.data.title,
        //         recipe.image = res.data.image,
        //         recipe.readyInMinutes = res.data.readyInMinutes,
        //         recipe.sourceUrl = res.data.sourceUrl,
        //         recipe.instructions = res.data.instructions ,
        //         recipe.ingredients = res.data.extendedIngredients,
        //         recipe.spoonId = res.data.id
        //         commit('setActiveRecipe', recipe)
        //     })
        // },
    
        //AUTH STUFF
        login({ commit, dispatch }, loginCredentials) {
            auth.post('/login', loginCredentials)
                .then(res => {
                    console.log("successfully logged in!")
                    commit('setUser', res.data)
                    router.push({ name: 'Home' })
                })
        },
        logout({ commit, dispatch }) {
            auth.delete('/logout')
                .then(res => {
                    console.log("Successfully logged out!")
                    commit('deleteUser')
                    //   router.push({name: 'Login'})
                })
        },
        register({ commit, dispatch }, userData) {
            auth.post('/register', userData)
                .then(res => {
                    console.log("Registration Successful")
                    router.push({ name: 'Home' }) // I changed this to just change the component 
                })
        },
        authenticate({ commit, dispatch }) {
            api.get('/authenticate')
                .then(res => {
                    commit('setUser', res.data)
                    // router.push({ name: 'Home' })
                })
                .catch(res => {
                    console.log(res.data)
                })
        },
        postGrocery({ commit, dispatch }, foodItem) {
            api.post('/thepantry', foodItem)
                .then(res => {
                    dispatch("getGroceries")
                })
                .catch(res => {
                    alert("err")
                })
        },
        getGroceries({ commit, dispatch }, user) {
            api.get('/myPantry/' + user)
                .then(res => {
                    commit("setPantry", res.data)
                })
        },
        addToFavorites({commit, dispatch, state}, recipe){
            api.post('/favorites', recipe)
            .then(res=>{
            commit ('setFavorites', res.data)
            })
        },
        getFavorites({commit, dispatch, state}, recipe){
            api.get('/favorites', recipe)
            .then(res=>{
                commit ('setFavorites', res.data.favorites)
            })
        },
        // deleteFavorite({ commit, dispatch }) {
        //     api.delete('/favorites/:id')
        //         .then(res => {
        //             console.log("Successfully deleted favorite!")
        //             commit('deleteFavorite')
                    
        //         })
        // },
        deleteFavorite ({ commit, dispatch }, id) {
            api.delete('favorites/'+ id).then(res => {
              dispatch('getFavorites')
            })
          }
    }
})
