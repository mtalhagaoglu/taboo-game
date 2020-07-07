import React from "react"
import PropTypes from "prop-types"
import TabooCard from "components/TabooCard"
import TextLink from "components/TextLink"

const MainMenu = ({ match }) => {
  const { path } = match

  const cardInfo = {
    type: "home",
    tabooWord: "Menu",
    list: [
      <TextLink to={`${path}/create`} text={"Create New Game"} />,
      <TextLink to={`${path}/join`} text={"Join Game"} />,
      <TextLink to={`${path}/rules/0`} text={"How to Play"} />,
      <TextLink to="/submit" text={"Submit a Card"} />,
    ],
  }
  return <TabooCard {...cardInfo} />
}

MainMenu.propTypes = {
  match: PropTypes.object.isRequired,
}

export default MainMenu