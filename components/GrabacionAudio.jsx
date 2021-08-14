import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Animated,
  Pressable,
} from "react-native";
import { Audio } from "expo-av";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";

let grabacion = new Audio.Recording();

const GrabacionAudio = ({ navigation }) => {
  const [RecordedURI, SetRecordedURI] = useState("");
  const [isRecording, SetisRecording] = useState(false);
  const Reproductor = useRef(new Audio.Sound());
  const [tiempo, setTiempo] = useState(10);

  async function iniciarGrabacion() {
    try {
      console.log("Pidiendo permisos para grabar...");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Empezando a grabar...");

      await grabacion.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await grabacion.startAsync();
      console.log("grabacion iniciada");
      SetisRecording(true);
    } catch (error) {
      console.error("Error: No se pudo grabar", error);
    }
  }

  async function detenerGrabacion() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const status = await grabacion.getStatusAsync();
    if (status.isRecording === true) {
      try {
        await grabacion.stopAndUnloadAsync();
        const result = grabacion.getURI();
        SetRecordedURI(result); // Here is the URI
        grabacion = new Audio.Recording();
        SetisRecording(false);
        console.log("Grabacion detenida");
        console.log("Fue grabado en :", result);
      } catch (error) {
        if (error.message.includes("Error: Grabacion no detenida")) {
          await grabacion._cleanupForUnloadedRecorder({
            canRecord: false,
            durationMillis: 0,
            isRecording: false,
            isDoneRecording: false,
          });
          console.log(`detenerGrabacion() error handler: ${error}`);
        } else if (
          error.message.includes(
            "Cannot unload a Recording that has already been unloaded."
          ) ||
          error.message.includes(
            "Error: Cannot unload a Recording that  has not been prepared."
          )
        ) {
          console.log(`detenerGrabacion() error handler: ${error}`);
        } else {
          console.log(`detenerGrabacion() error: ${error}`);
        }
      }
    }
  }

  const reproducirSonido = async () => {
    try {
      const result = await Reproductor.current.loadAsync(
        { uri: RecordedURI },
        {},
        true
      );

      const response = await Reproductor.current.getStatusAsync();
      if (response.isLoaded) {
        if (response.isPlaying === false) {
          Reproductor.current.playAsync();
          SetisPLaying(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const revisarTiempo = (remainingTime, tiempoPasado) => {
    console.log(
      "Restante",
      remainingTime,
      " Lo que ya paso ",
      tiempoPasado,
      "tiempo set",
      tiempo
    );
    if (remainingTime <= 0) {
      detenerGrabacion();
    }
  };

  const detenerSonido = async () => {
    try {
      const checkLoading = await Reproductor.current.getStatusAsync();
      if (checkLoading.isLoaded === true) {
        await Reproductor.current.stopAsync();
        SetisPLaying(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <CountdownCircleTimer
        isPlaying
        duration={tiempo}
        colors={[
          ["#F91561", 0.5],
          ["#F9195F", 0.3],
          ["#FADD0B", 0.2],
        ]}
      >
        {({ remainingTime, elapsedTime, animatedColor }) => (
          <Pressable>
            {revisarTiempo(remainingTime, elapsedTime)}

            <Animated.Text style={{ color: animatedColor }}>
              {remainingTime}
            </Animated.Text>
          </Pressable>
        )}
      </CountdownCircleTimer>

      <Button
        mode="contained"
        title="A grabar"
        onPress={() => iniciarGrabacion()}
      />
      <Button
        mode="contained"
        title="Deja de grabar"
        onPress={() => detenerGrabacion()}
      />
      <Button
        mode="contained"
        title="Reproducir sonido grabado"
        onPress={() => reproducirSonido()}
      />
      <Button
        mode="contained"
        title="Detener sonido grabado"
        onPress={() => detenerSonido()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GrabacionAudio;
