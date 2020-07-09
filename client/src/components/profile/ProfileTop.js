import React from 'react';
import PropTypes from 'prop-types';

const ProfileTop = ({ profile: {
    status,
    company,
    location,
    website,
    sociallinks,
    user : { name, avatar }
}}) => {
    return (
        <div class="profile-top bg-primary p-2">
          <img
            class="round-img my-1"
            src={avatar}
            alt=""
          />
          <h1 class="large">{name}</h1>
          <p class="lead">{status} at {company && <span> at {company}</span>}</p>
          <p>{location && <span>{location}</span>}</p>
          <div class="icons my-1">
          {
              website && (
                <a href={website} target="_blank" rel="noopener noreferrer">
                    <i class="fa fa-globe fa-2x"></i>
                </a>
              )
          }

          {
              sociallinks && sociallinks.twitter && (
                <a href={sociallinks.twitter} target="_blank" rel="noopener noreferrer">
                    <i class="fa fa-twitter fa-2x"></i>
                </a>
              )
          }

          {
            sociallinks && sociallinks.facebook && (
              <a href={sociallinks.facebook} target="_blank" rel="noopener noreferrer">
                <i class="fab fa-facebook fa-2x"></i>
              </a>
            )
          }

          {
            sociallinks && sociallinks.linkedin && (
              <a href={sociallinks.linkedin} target="_blank" rel="noopener noreferrer">
                <i class="fab fa-linkedin fa-2x"></i>
              </a>
            )
          }

          {
            sociallinks && sociallinks.youtube && (
              <a href={sociallinks.youtube} target="_blank" rel="noopener noreferrer">
                <i class="fab fa-youtube fa-2x"></i>
              </a>
            )
          } 


          {
            sociallinks && sociallinks.instagram && (
              <a href={sociallinks.instagram} target="_blank" rel="noopener noreferrer">
                <i class="fab fa-instagram fa-2x"></i>
              </a>              
            )
          } 

          </div>
        </div>

    )
}

ProfileTop.propTypes = {
    profile: PropTypes.object.isRequired
}

export default ProfileTop
