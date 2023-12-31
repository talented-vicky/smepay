const passport = require('passport');
const gglStrategy = require('passport-google-oauth2').Strategy;
const jwtStrategy = require('passport-jwt').Strategy
const { ExtractJwt } = require('passport-jwt')

const { google_client_id, google_client_secret, redirect_url, json_secret} = require('./secret_keys')
const User = require('../models/user')

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

// to configure passport to use google OAuth2 auth strategy
passport.use(
    new gglStrategy({
        clientID: google_client_id,
        clientSecret: google_client_secret,
        callbackURL: redirect_url,
        passReqToCallback: true
    },  
    // cb func that executes when a user is successfully
    // authenticated
    async (request, accessToken, refreshToken, profile, done) => {
        try {
            // find user, check for existence and save new input credentials
            let oldUser = await User.findOne({ 'google.id': profile.id })
            if(oldUser){
                return done(null, oldUser)
            }
            const newUser = new User({
                method: 'google',
                google: {
                    id: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName
                }
            })
            await newUser.save()
            return done(null, profile)
            
        } catch (error) {
            return done(error, false)
        }
    }
))

// to configure passport to use jwt (json web token) authentication strategy
passport.use(
    new jwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromHeader("authorization"),
            secretOrKey: json_secret
        },
        async (jwtPayload, done) => {
            try {
                const user = jwtPayload.user
                done(null, user)
            } catch (error) {
                done(error, false)
            }
        }
    )
)