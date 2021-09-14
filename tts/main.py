import os
import json
import torch
from shutil import copyfile

device = torch.device('cpu')
torch.set_num_threads(4)
local_file = 'model.pt'

if not os.path.isfile(local_file):
    torch.hub.download_url_to_file('https://models.silero.ai/models/tts/en/v1_lj_16000.jit.pt',
                                   local_file)  

model = torch.package.PackageImporter(local_file).load_pickle("tts_models", "model")
model.to(device)
sample_rate = 8000


f = open('../data/data.json')
data = json.load(f)
f.close()
words = data['all']
print(len(words))
for i in range(len(words)):
    print(i)
    word = words[i]
    model.save_wav(texts=[word],
                             sample_rate=sample_rate)
    copyfile('test_000.wav', 'speech/{}.wav'.format(word))
