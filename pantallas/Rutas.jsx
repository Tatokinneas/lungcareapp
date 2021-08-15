import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import AudioRecoder from "../components/GrabacionAudio";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export const Rutas = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Inicio" component={AudioRecoder} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Rutas;
