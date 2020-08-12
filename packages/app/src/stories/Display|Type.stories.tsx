import React from 'react';
import styled from 'styled-components/macro';
import Type from 'components/Type';

const TypeStories = {
  title: 'Display/Type',
  component: Type,
};

export default TypeStories;

const Container = styled.div`
  max-width: 500px;
  text-align: left;
`;

export const AllTypographyScales = () => (
  <Container>
    <Type scale="h1">h1. Heading</Type>
    <Type scale="h2">h2. Heading</Type>
    <Type scale="h3">h3. Heading</Type>
    <Type scale="h4">h4. Heading</Type>
    <Type scale="h5">h5. Heading</Type>
    <Type scale="h6">h6. Heading</Type>
    <Type scale="body1">
      body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
      blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur,
      neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti?
      Eum quasi quidem quibusdam.
    </Type>
    <Type scale="body2">
      body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
      blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur,
      neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti?
      Eum quasi quidem quibusdam.
    </Type>
  </Container>
);
