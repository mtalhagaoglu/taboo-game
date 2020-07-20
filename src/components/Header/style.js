import styled, { css } from "styled-components"

export const StyledHeader = styled.header`
    margin-top: ${props => props.large ? "3rem" : "2rem"};
    margin-bottom: ${props => props.subheading ? "5rem" : "3rem"};
`

export const Title = styled.h1`
  background: none;
  font-family: ${(props) => props.theme.text.display};
  font-size: ${(props) => props.theme.fontSize.medium};
  color: ${(props) => props.theme.color.primary};
  text-shadow: 0px .5rem .5rem rgba(0, 0, 0, 0.6);
  text-transform: uppercase;

  ${(props) =>
    props.large &&
    css`
      font-size: ${(props) => props.theme.fontSize.xlarge};
      text-shadow: 0px .3rem .6rem rgba(0, 0, 0, 0.6);
      text-align: center;
      margin: 1rem 0;
    `}
`
Title.displayName="Title"

export const Subheading = styled.h3`
  font-size: 2.7rem;
  text-align: center;
  width: 30rem;
  margin: 0 auto;
  font-weight: 400;
  font-family: ${(props) => props.theme.text.display};
  color: ${(props) => props.theme.color.grayDark1};
`
Subheading.displayName = "Subbeading"

export const FocusSpan = styled.span`
  color: ${props => props.theme.color.primary};

`
FocusSpan.displayName = "FocusSpan"